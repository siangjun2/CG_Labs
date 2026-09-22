#version 410

layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec3 texcoord;
layout (location = 3) in vec3 tangent;
layout (location = 4) in vec3 binormal;

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip;

uniform vec3 light_position;
uniform vec3 camera_position;
uniform int use_normal_mapping;

out VS_OUT {
	vec3 fN;
	vec3 fL;
	vec3 fV;
	vec3 fT;
	vec3 fB;
	vec2 texcoord;
} vs_out;

void main()
{
	vec3 worldPos = vec3(vertex_model_to_world * vec4(vertex, 1.0));

	vs_out.fN = vec3(normal_model_to_world * vec4(normal, 0.0));
	vs_out.fT = vec3(vertex_model_to_world * vec4(tangent, 0.0));
	vs_out.fB = vec3(vertex_model_to_world * vec4(binormal, 0.0));
	vs_out.fL = light_position - worldPos;
	vs_out.fV = camera_position - worldPos;
	vs_out.texcoord = texcoord.xy;

	gl_Position = vertex_world_to_clip * vec4(worldPos, 1.0);
}
