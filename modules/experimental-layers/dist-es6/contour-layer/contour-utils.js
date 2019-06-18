import * as MarchingSquares from './marching-squares';
import assert from 'assert'; // Given all the cell weights, generates contours for each threshold.

export function generateContours({
  thresholds,
  colors,
  cellWeights,
  gridSize,
  gridOrigin,
  cellSize
}) {
  const contourSegments = [];
  thresholds.forEach((threshold, index) => {
    const numCols = gridSize[0];

    for (let cellIndex = 0; cellIndex < gridSize[0] * (gridSize[1] - 1); cellIndex++) {
      if (cellIndex === 0 || (cellIndex + 1) % numCols !== 0) {
        // Get the MarchingSquares code based on neighbor cell weights.
        const code = MarchingSquares.getCode({
          cellWeights,
          thresholdValue: threshold,
          cellIndex,
          gridSize
        }); // Get the intersection vertices based on MarchingSquares code.

        const vertices = MarchingSquares.getVertices({
          gridOrigin,
          cellIndex,
          cellSize,
          gridSize,
          code
        }); // We should always get even number of vertices

        assert(vertices.length % 2 === 0);

        for (let i = 0; i < vertices.length; i += 2) {
          contourSegments.push({
            start: vertices[i],
            end: vertices[i + 1],
            threshold
          });
        }
      }
    }
  });
  return contourSegments;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250b3VyLWxheWVyL2NvbnRvdXItdXRpbHMuanMiXSwibmFtZXMiOlsiTWFyY2hpbmdTcXVhcmVzIiwiYXNzZXJ0IiwiZ2VuZXJhdGVDb250b3VycyIsInRocmVzaG9sZHMiLCJjb2xvcnMiLCJjZWxsV2VpZ2h0cyIsImdyaWRTaXplIiwiZ3JpZE9yaWdpbiIsImNlbGxTaXplIiwiY29udG91clNlZ21lbnRzIiwiZm9yRWFjaCIsInRocmVzaG9sZCIsImluZGV4IiwibnVtQ29scyIsImNlbGxJbmRleCIsImNvZGUiLCJnZXRDb2RlIiwidGhyZXNob2xkVmFsdWUiLCJ2ZXJ0aWNlcyIsImdldFZlcnRpY2VzIiwibGVuZ3RoIiwiaSIsInB1c2giLCJzdGFydCIsImVuZCJdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLQSxlQUFaLE1BQWlDLG9CQUFqQztBQUNBLE9BQU9DLE1BQVAsTUFBbUIsUUFBbkIsQyxDQUVBOztBQUNBLE9BQU8sU0FBU0MsZ0JBQVQsQ0FBMEI7QUFDL0JDLFlBRCtCO0FBRS9CQyxRQUYrQjtBQUcvQkMsYUFIK0I7QUFJL0JDLFVBSitCO0FBSy9CQyxZQUwrQjtBQU0vQkM7QUFOK0IsQ0FBMUIsRUFPSjtBQUNELFFBQU1DLGtCQUFrQixFQUF4QjtBQUVBTixhQUFXTyxPQUFYLENBQW1CLENBQUNDLFNBQUQsRUFBWUMsS0FBWixLQUFzQjtBQUN2QyxVQUFNQyxVQUFVUCxTQUFTLENBQVQsQ0FBaEI7O0FBQ0EsU0FBSyxJQUFJUSxZQUFZLENBQXJCLEVBQXdCQSxZQUFZUixTQUFTLENBQVQsS0FBZUEsU0FBUyxDQUFULElBQWMsQ0FBN0IsQ0FBcEMsRUFBcUVRLFdBQXJFLEVBQWtGO0FBQ2hGLFVBQUlBLGNBQWMsQ0FBZCxJQUFtQixDQUFDQSxZQUFZLENBQWIsSUFBa0JELE9BQWxCLEtBQThCLENBQXJELEVBQXdEO0FBQ3REO0FBQ0EsY0FBTUUsT0FBT2YsZ0JBQWdCZ0IsT0FBaEIsQ0FBd0I7QUFDbkNYLHFCQURtQztBQUVuQ1ksMEJBQWdCTixTQUZtQjtBQUduQ0csbUJBSG1DO0FBSW5DUjtBQUptQyxTQUF4QixDQUFiLENBRnNELENBUXREOztBQUNBLGNBQU1ZLFdBQVdsQixnQkFBZ0JtQixXQUFoQixDQUE0QjtBQUMzQ1osb0JBRDJDO0FBRTNDTyxtQkFGMkM7QUFHM0NOLGtCQUgyQztBQUkzQ0Ysa0JBSjJDO0FBSzNDUztBQUwyQyxTQUE1QixDQUFqQixDQVRzRCxDQWdCdEQ7O0FBQ0FkLGVBQU9pQixTQUFTRSxNQUFULEdBQWtCLENBQWxCLEtBQXdCLENBQS9COztBQUNBLGFBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSCxTQUFTRSxNQUE3QixFQUFxQ0MsS0FBSyxDQUExQyxFQUE2QztBQUMzQ1osMEJBQWdCYSxJQUFoQixDQUFxQjtBQUNuQkMsbUJBQU9MLFNBQVNHLENBQVQsQ0FEWTtBQUVuQkcsaUJBQUtOLFNBQVNHLElBQUksQ0FBYixDQUZjO0FBR25CVjtBQUhtQixXQUFyQjtBQUtEO0FBQ0Y7QUFDRjtBQUNGLEdBOUJEO0FBK0JBLFNBQU9GLGVBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIE1hcmNoaW5nU3F1YXJlcyBmcm9tICcuL21hcmNoaW5nLXNxdWFyZXMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG4vLyBHaXZlbiBhbGwgdGhlIGNlbGwgd2VpZ2h0cywgZ2VuZXJhdGVzIGNvbnRvdXJzIGZvciBlYWNoIHRocmVzaG9sZC5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUNvbnRvdXJzKHtcbiAgdGhyZXNob2xkcyxcbiAgY29sb3JzLFxuICBjZWxsV2VpZ2h0cyxcbiAgZ3JpZFNpemUsXG4gIGdyaWRPcmlnaW4sXG4gIGNlbGxTaXplXG59KSB7XG4gIGNvbnN0IGNvbnRvdXJTZWdtZW50cyA9IFtdO1xuXG4gIHRocmVzaG9sZHMuZm9yRWFjaCgodGhyZXNob2xkLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG51bUNvbHMgPSBncmlkU2l6ZVswXTtcbiAgICBmb3IgKGxldCBjZWxsSW5kZXggPSAwOyBjZWxsSW5kZXggPCBncmlkU2l6ZVswXSAqIChncmlkU2l6ZVsxXSAtIDEpOyBjZWxsSW5kZXgrKykge1xuICAgICAgaWYgKGNlbGxJbmRleCA9PT0gMCB8fCAoY2VsbEluZGV4ICsgMSkgJSBudW1Db2xzICE9PSAwKSB7XG4gICAgICAgIC8vIEdldCB0aGUgTWFyY2hpbmdTcXVhcmVzIGNvZGUgYmFzZWQgb24gbmVpZ2hib3IgY2VsbCB3ZWlnaHRzLlxuICAgICAgICBjb25zdCBjb2RlID0gTWFyY2hpbmdTcXVhcmVzLmdldENvZGUoe1xuICAgICAgICAgIGNlbGxXZWlnaHRzLFxuICAgICAgICAgIHRocmVzaG9sZFZhbHVlOiB0aHJlc2hvbGQsXG4gICAgICAgICAgY2VsbEluZGV4LFxuICAgICAgICAgIGdyaWRTaXplXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBHZXQgdGhlIGludGVyc2VjdGlvbiB2ZXJ0aWNlcyBiYXNlZCBvbiBNYXJjaGluZ1NxdWFyZXMgY29kZS5cbiAgICAgICAgY29uc3QgdmVydGljZXMgPSBNYXJjaGluZ1NxdWFyZXMuZ2V0VmVydGljZXMoe1xuICAgICAgICAgIGdyaWRPcmlnaW4sXG4gICAgICAgICAgY2VsbEluZGV4LFxuICAgICAgICAgIGNlbGxTaXplLFxuICAgICAgICAgIGdyaWRTaXplLFxuICAgICAgICAgIGNvZGVcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIFdlIHNob3VsZCBhbHdheXMgZ2V0IGV2ZW4gbnVtYmVyIG9mIHZlcnRpY2VzXG4gICAgICAgIGFzc2VydCh2ZXJ0aWNlcy5sZW5ndGggJSAyID09PSAwKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICAgIGNvbnRvdXJTZWdtZW50cy5wdXNoKHtcbiAgICAgICAgICAgIHN0YXJ0OiB2ZXJ0aWNlc1tpXSxcbiAgICAgICAgICAgIGVuZDogdmVydGljZXNbaSArIDFdLFxuICAgICAgICAgICAgdGhyZXNob2xkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gY29udG91clNlZ21lbnRzO1xufVxuIl19