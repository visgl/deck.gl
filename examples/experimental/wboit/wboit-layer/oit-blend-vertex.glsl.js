export default `\
#version 300 es
in vec4 positions;

void main() {
    gl_Position = positions;
}
`;
