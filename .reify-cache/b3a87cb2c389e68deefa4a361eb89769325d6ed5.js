"use strict";module.export({initializeShaderModules:()=>initializeShaderModules,fp32:()=>fp32,fp64:()=>fp64,picking:()=>picking,project:()=>project,project64:()=>project64,phonglighting:()=>phonglighting});var registerShaderModules,setDefaultShaderModules;module.link('luma.gl',{registerShaderModules(v){registerShaderModules=v},setDefaultShaderModules(v){setDefaultShaderModules=v}},0);var fp32,fp64,picking,phonglighting;module.link('luma.gl',{fp32(v){fp32=v},fp64(v){fp64=v},picking(v){picking=v},phonglighting(v){phonglighting=v}},1);var project;module.link('../shaderlib/project/project',{default(v){project=v}},2);var project32;module.link('../shaderlib/project32/project32',{default(v){project32=v}},3);var project64;module.link('../shaderlib/project64/project64',{default(v){project64=v}},4);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.







function initializeShaderModules() {
  registerShaderModules([fp32, fp64, project, project32, project64, phonglighting, picking]);

  setDefaultShaderModules([project]);
}

initializeShaderModules();


