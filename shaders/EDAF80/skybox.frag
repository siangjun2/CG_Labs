#version 410

in VS_OUT {
	vec3 texcoord;
} fs_in;

uniform samplerCube cube_texture;
uniform int has_textures;
uniform int has_diffuse_texture;
uniform int has_opacity_texture;

out vec4 frag_color;

void main()
{
    vec3 dir = normalize(fs_in.texcoord);

    frag_color = texture(cube_texture, dir);
}