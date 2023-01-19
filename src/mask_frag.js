const mask_frag = /* glsl */`
varying vec2 vUv;
uniform sampler2D tDiffuse;

void main() {
    vec4 col = texture2D( tDiffuse, vUv );
    if(col.r == 0.0 && col.g == 0.0 && col.b == 0.0){
        //Make the silhouette to be outlined red
        col.r = 1.0; 
    } else {
        //Make bg another color, non-red, dark here just for layer visibility
        col.rgb = vec3(0.1,0.1,0.1);
    }
    gl_FragColor = col;
}`;
export default mask_frag; 