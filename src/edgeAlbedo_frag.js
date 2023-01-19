const edgeAlbedo_frag = /* glsl */`

varying vec2 vUv;

uniform vec2 viewportSize;

#define LINE_WEIGHT 10.0

uniform sampler2D gbufferMask; //the object red and bg black or transparent
uniform sampler2D gbufferAlbedo;

void main() {
   float dx = (1.0 / viewportSize.x) * LINE_WEIGHT;
   float dy = (1.0 / viewportSize.y) * LINE_WEIGHT;

   vec2 uvCenter   = vUv;
   vec2 uvRight    = vec2(uvCenter.x + dx, uvCenter.y);
   vec2 uvTop      = vec2(uvCenter.x,      uvCenter.y - dx);
   vec2 uvTopRight = vec2(uvCenter.x + dx, uvCenter.y - dx);

   float mCenter   = texture(gbufferMask, uvCenter).r;
   float mTop      = texture(gbufferMask, uvTop).r;
   float mRight    = texture(gbufferMask, uvRight).r;
   float mTopRight = texture(gbufferMask, uvTopRight).r;

   float dT  = abs(mCenter - mTop);
   float dR  = abs(mCenter - mRight);
   float dTR = abs(mCenter - mTopRight);

   float delta = 0.0;
   delta = max(delta, dT);
   delta = max(delta, dR);
   delta = max(delta, dTR);

   float threshold    = 0.0;
   float deltaClipped = clamp((delta * 2.0) - threshold, 0.0, 1.0);

   vec4 outline = vec4(deltaClipped, deltaClipped, deltaClipped, 1.0);
   vec4 albedo  = texture(gbufferAlbedo, vUv);

   gl_FragColor = albedo - outline;
}`;
export default edgeAlbedo_frag;