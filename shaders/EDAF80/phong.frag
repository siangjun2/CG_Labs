#version 410

in VS_OUT {
	vec3 fN;
    vec3 fL;
    vec3 fV;
    vec3 fT;
    vec3 fB;
    vec2 texcoord;
} fs_in;

uniform sampler2D diffuse_texture;
uniform sampler2D normal_texture;
uniform sampler2D rough_texture;

uniform vec3 ambient_colour;
uniform vec3 diffuse_colour;
uniform vec3 specular_colour;
uniform float shininess_value;

uniform int has_diffuse_texture;
uniform int use_normal_mapping;
uniform int use_rough_mapping;

out vec4 frag_color;

void main()
{
    vec3 N = normalize(fs_in.fN);
    vec3 T = normalize(fs_in.fT);
    vec3 B = normalize(fs_in.fB);

    vec3 L = normalize(fs_in.fL);
    vec3 V = normalize(fs_in.fV);
    vec3 H = normalize(L + V);

    vec3 ka = ambient_colour;
    vec3 kd = diffuse_colour;
    vec3 ks = specular_colour;

    if (has_diffuse_texture != 0) {
        kd = texture(diffuse_texture, fs_in.texcoord).rgb;
    }

    if (use_normal_mapping != 0) {
        // Map from RGB in range [0,1] to coefficient in range [-1,1]
        vec3 tangent_space_normal = texture(normal_texture, fs_in.texcoord).rgb * 2.0 - 1.0;
        // Build TBN matrix from interpolated tangent/bitangent/normal (world-space)
        mat3 TBN = mat3(T, B, N);
        N = normalize(TBN * tangent_space_normal);
    }

    if (use_rough_mapping != 0) {
    float rough = texture(rough_texture, fs_in.texcoord).x;
        float spec_factor = clamp(1.0 - rough, 0.0, 1.0);
        ks *= spec_factor;
    }

    vec3 diffuse = kd * max(dot(N,L), 0.0);
    vec3 specular = ks * pow(max(dot(N, H), 0.0), shininess_value);

    vec3 out_color = ka + diffuse + specular;
    frag_color = vec4(out_color, 1.0);
}