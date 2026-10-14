#version 410

in VS_OUT {
    vec3 world_position;
    vec3 normal;
    vec3 tangent;
    vec3 bitangent;
    vec2 texcoord;
} fs_in;

uniform samplerCube cube_texture;
uniform sampler2D normal_texture;
uniform int has_cube_texture;
uniform int has_normal_texture;
uniform int use_base_color;
uniform int use_reflection;
uniform int use_refraction;
uniform float time;
uniform vec3 camera_position;

out vec4 frag_color;

void main()
{
    vec3 normal = normalize(fs_in.normal);
    vec3 view_direction = normalize(camera_position - fs_in.world_position);
    bool front_facing = gl_FrontFacing;

    // Normal mapping
    if (has_normal_texture != 0) {
        vec3 tangent = normalize(fs_in.tangent);
        vec3 bitangent = normalize(fs_in.bitangent);
        // Given constants in seminar
        vec2 texScale = vec2(8.0, 4.0);
        float normalTime = mod(time, 100.0);
        vec2 normalSpeed = vec2(-0.05, 0.0);

        vec2 normalCoord0 = fs_in.texcoord * texScale + normalTime * normalSpeed;
        vec2 normalCoord1 = fs_in.texcoord * texScale * 2.0 + normalTime * normalSpeed * 4.0;
        vec2 normalCoord2 = fs_in.texcoord * texScale * 4.0 + normalTime * normalSpeed * 8.0;
        vec3 nt0 = texture(normal_texture, normalCoord0).rgb * 2.0 - 1.0;
        vec3 nt1 = texture(normal_texture, normalCoord1).rgb * 2.0 - 1.0;
        vec3 nt2 = texture(normal_texture, normalCoord2).rgb * 2.0 - 1.0;
        vec3 tangent_normal = normalize(nt0 + nt1 + nt2);
        
        // New normal from normal texture
        normal = normalize(mat3(tangent, bitangent, normal) * tangent_normal);
    }
    if (!front_facing)
        normal = -normal;

    vec3 reflection_direction = reflect(-view_direction, normal);

    // Base colour
    vec4 color_deep = vec4(0.0, 0.0, 0.1, 1.0);
    vec4 color_shallow = vec4(0.0, 0.5, 0.5, 1.0);
    float facing = 1.0 - max(dot(view_direction, normal), 0.0);
    vec3 base_color = mix(color_deep.rgb, color_shallow.rgb, facing);
    vec3 water_color = use_base_color != 0 ? base_color : vec3(0.0);

    if (has_cube_texture != 0) {
        bool show_reflection = use_reflection != 0;
        bool show_refraction = use_refraction != 0;
        vec3 reflection = vec3(0.0);
        vec3 refraction = vec3(0.0);
    
        float r0 = 0.02037;
        float cos_theta = clamp(dot(view_direction, normal), 0.0, 1.0);
        float fresnel = r0 + (1.0 - r0) * pow(1.0 - cos_theta, 5.0);

        if (show_reflection)
            reflection = texture(cube_texture, reflection_direction).rgb;

        if (show_refraction) {
            vec3 incident = -view_direction;
            const float eta_air_to_water = 1.0 / 1.33;
            const float eta_water_to_air = 1.33;
            float eta = front_facing ? eta_air_to_water : eta_water_to_air;
            vec3 refraction_direction = refract(incident, normal, eta);
            refraction = texture(cube_texture, refraction_direction).rgb;
        }

        water_color = water_color + reflection * fresnel + refraction * (1.0 - fresnel);
    }

    frag_color = vec4(water_color, 1.0);
}