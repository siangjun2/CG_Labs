#version 410

layout (location = 0) in vec3 vertex;
layout (location = 2) in vec3 texcoord;

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip;
uniform float time;

out VS_OUT {
    vec3 world_position;
    vec3 normal;
    vec3 tangent;
    vec3 bitangent;
    vec2 texcoord;
} vs_out;

float wave(vec2 position, vec2 direction, float amplitude, float frequency, float phase, float sharpness, float time, out float derivative_x, out float derivative_z)
{
    float angle = dot(direction, position) * frequency + time * phase;
    float alpha = 0.5 * sin(angle) + 0.5;
    float derivative_scale = 0.5 * sharpness * frequency * amplitude * pow(alpha, sharpness - 1.0) * cos(angle);

    derivative_x = derivative_scale * direction.x;
    derivative_z = derivative_scale * direction.y;
    return amplitude * pow(alpha, sharpness);
}

void main()
{
    vec3 displaced_vertex = vertex;
    float derivative_x1;
    float derivative_z1;
    float derivative_x2;
    float derivative_z2;

    // Wave 1 and wave 2
    float wave1 = wave(vertex.xz, vec2(-1.0, 0.0), 1.0, 0.2, 0.5, 2.0, time, derivative_x1, derivative_z1);
    float wave2 = wave(vertex.xz, vec2(-0.7, 0.7), 0.5, 0.4, 1.3, 2.0, time, derivative_x2, derivative_z2);
    displaced_vertex.y += wave1 + wave2;

    vec3 tangent_model = normalize(vec3(1.0, derivative_x1 + derivative_x2, 0.0));
    vec3 bitangent_model = normalize(vec3(0.0, derivative_z1 + derivative_z2, 1.0));
    vec3 normal_model = normalize(cross(bitangent_model, tangent_model));

    vec4 world_position = vertex_model_to_world * vec4(displaced_vertex, 1.0);
    vs_out.world_position = world_position.xyz;
    vs_out.normal = normalize((normal_model_to_world * vec4(normal_model, 0.0)).xyz);
    vs_out.tangent = normalize((vertex_model_to_world * vec4(tangent_model, 0.0)).xyz);
    vs_out.bitangent = normalize((vertex_model_to_world * vec4(bitangent_model, 0.0)).xyz);
    vs_out.texcoord = texcoord.xy;

	gl_Position = vertex_world_to_clip * world_position;
}
