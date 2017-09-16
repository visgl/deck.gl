import {createGLContext} from 'luma.gl';
import global from 'global';

global.glContext = global.glContext || createGLContext();

export default global.glContext;
