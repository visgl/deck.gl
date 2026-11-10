// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  GPUGroupAggregation,
  GPUReduction,
  type GPUGroupAggregationOperation as GroupStatistic,
  type GPUReductionOperation as ReductionStatistic
} from '@luma.gl/graph/gpu-core';
import type {
  GPUOperation,
  GPUOperationContract,
  GPUOperationLowering,
  GPUOperationLoweringContext
} from '@luma.gl/graph/gpu-graph';

type GroupProps = {keys: string; mask?: string; output: string} & (
  | {operation: 'count'; values?: never}
  | {operation: Exclude<GroupStatistic, 'count'>; values: string}
);
type ReductionProps = {input: string; mask?: string; output: string; operation: ReductionStatistic};

/** Logical dense-group aggregation, independent of projection and layer lifecycle. */
export class GPUGroupAggregationOperation implements GPUOperation {
  readonly type = 'group-aggregation';
  readonly id: string;
  readonly props: Readonly<GroupProps>;
  constructor(props: GroupProps & {id?: string}) {
    this.id = props.id ?? `${props.output}-group-aggregation`;
    this.props = Object.freeze({...props});
  }
  get contract(): GPUOperationContract {
    const {keys, values, mask, output} = this.props;
    return {
      values: [
        {value: keys, access: 'read'},
        ...(values ? [{value: values, access: 'read' as const}] : []),
        ...(mask ? [{value: mask, access: 'read' as const}] : []),
        {value: output, access: 'write'}
      ]
    };
  }
}

/** Logical float32 reduction with a fixed one-row or two-row result. */
export class GPUReductionOperation implements GPUOperation {
  readonly type = 'reduction';
  readonly id: string;
  readonly props: Readonly<ReductionProps>;
  constructor(props: ReductionProps & {id?: string}) {
    this.id = props.id ?? `${props.output}-reduction`;
    this.props = Object.freeze({...props});
  }
  get contract(): GPUOperationContract {
    const {input, mask, output, operation} = this.props;
    return {
      values: [
        {value: input, access: 'read'},
        ...(mask ? [{value: mask, access: 'read' as const}] : []),
        {value: output, access: 'write', shape: {length: operation === 'extent' ? 2 : 1}}
      ]
    };
  }
}

function getPackedOutput<T extends 'uint32' | 'float32'>(
  context: GPUOperationLoweringContext,
  name: string,
  format: T
) {
  const output = context.resolveVector<T>(name);
  if (output.format !== format || output.data.length !== 1) {
    throw new Error(`${name} requires one packed ${format} output chunk`);
  }
  return output.data[0];
}

/** Separate compiler lowerings for the reusable semantic operations. */
export const aggregationOperationLowerings: readonly GPUOperationLowering[] = [
  {
    type: 'group-aggregation',
    lower(operation, context) {
      const {props, id} = operation as GPUGroupAggregationOperation;
      const keys = context.resolveVector<'uint32'>(props.keys);
      const mask = props.mask ? context.resolveVector<'uint32'>(props.mask) : undefined;
      if (props.operation === 'count') {
        context.graph.add(
          new GPUGroupAggregation({
            id,
            keys,
            mask,
            operation: 'count',
            output: getPackedOutput(context, props.output, 'uint32')
          })
        );
      } else {
        if (!props.values) throw new Error('Weighted group aggregation requires values');
        context.graph.add(
          new GPUGroupAggregation({
            id,
            keys,
            mask,
            operation: props.operation,
            values: context.resolveVector<'float32'>(props.values),
            output: getPackedOutput(context, props.output, 'float32')
          })
        );
      }
    }
  },
  {
    type: 'reduction',
    lower(operation, context) {
      const {props, id} = operation as GPUReductionOperation;
      context.graph.add(
        new GPUReduction({
          id,
          operation: props.operation,
          input: context.resolveVector<'float32'>(props.input),
          mask: props.mask ? context.resolveVector<'uint32'>(props.mask) : undefined,
          output: getPackedOutput(context, props.output, 'float32')
        })
      );
    }
  }
];
