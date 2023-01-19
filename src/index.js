import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import mask_vert from "./mask_vert.js";
import mask_frag from "./mask_frag.js";
import edge_vert from "./edge_vert.js";
import edge_frag from "./edge_frag.js";
import edgeAlbedo_vert from "./edgeAlbedo_vert.js";
import edgeAlbedo_frag from "./edgeAlbedo_frag.js";

///Development tools
var controls;

///Canvas sizing/layout
var width, height, canvasSz;
if (window.innerHeight >= window.innerWidth) {
    var width = window.innerWidth;
    var height = window.innerWidth;
    canvasSz = height * 0.6;
} else {
    var width = window.innerHeight;
    var height = window.innerHeight;
    canvasSz = width * 0.6;
}

///Main scene
///This cam and scene are inside the screen quad
///Use these to edit the main scene content
var camera, scene, renderer;

///Scene objects
let maskScene, albedoScene, maskCam, maskRt, albedoRt;

function init() {

    //////////////////////////
    // Scene setup ///////////
    //////////////////////////

    /// create scenes

    scene = new THREE.Scene();
    maskScene = new THREE.Scene();
    albedoScene = new THREE.Scene();

    /// Main scene cam

    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 5000);
    camera.position.set(canvasSz, canvasSz, canvasSz);
    camera.lookAt(scene.position);

    /// Cam for mask buffer

    maskCam = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 5000);
    maskCam.position.set(canvasSz, canvasSz, canvasSz);
    maskCam.lookAt(scene.position);

    /// Light

    const light = new THREE.PointLight(0xffffff, 1.5)
    light.position.set(canvasSz, canvasSz, canvasSz)
    scene.add(light)
    const light2 = light.clone()
    albedoScene.add(light2)

    /// Create a webGL renderer

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x7e7e7e);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);

    /// Controls

    controls = new OrbitControls(camera, renderer.domElement);

    //////////////////////////
    // Scene content /////////
    //////////////////////////
    
    /// mask buffer

    maskRt = new THREE.WebGLRenderTarget(
        width, //resolution x
        height, //resolution y
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat
        }
    );

    var materialMask = new THREE.ShaderMaterial({
        uniforms: { tDiffuse: { value: maskRt.texture } },
        vertexShader: mask_vert,
        fragmentShader: mask_frag,
        depthWrite: true
    });

    /// Plane to display rendered mask

    var maskVizPlane = new THREE.PlaneGeometry(width / 2, height / 2);
    let maskVizQuad = new THREE.Mesh(maskVizPlane, materialMask);
    maskVizQuad.position.z = 0;
    scene.add(maskVizQuad);

    /// Plane to display rendered outline

    var materialOutline = new THREE.ShaderMaterial({
        uniforms: {
            gbufferMask: { value: maskRt.texture },
            viewportSize: { value: new THREE.Vector2(width, height) }
        },
        vertexShader: edge_vert,
        fragmentShader: edge_frag,
        depthWrite: true
    });

    var outlineVizPlane = new THREE.PlaneGeometry(width / 2, height / 2);
    let outlineVizQuad = new THREE.Mesh(outlineVizPlane, materialOutline);
    outlineVizQuad.position.z = - canvasSz/3;
    scene.add(outlineVizQuad);

    /// Albedo mask

    albedoRt = new THREE.WebGLRenderTarget(
        width, //resolution x
        height, //resolution y
        {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat
        }
    );

    /// Plane to display rendered outline + albedo

    var matAlbedoOutline = new THREE.ShaderMaterial({
        uniforms: {
            gbufferMask: { value: maskRt.texture },
            gbufferAlbedo: { value: albedoRt.texture },
            viewportSize: { value: new THREE.Vector2(width, height) }
        },
        vertexShader: edgeAlbedo_vert,
        fragmentShader: edgeAlbedo_frag,
        depthWrite: false
    });

    var finalVizPlane = new THREE.PlaneGeometry(width / 2, height / 2);
    let finalVizQuad = new THREE.Mesh(finalVizPlane, matAlbedoOutline);
    finalVizQuad.position.z = - canvasSz/3 * 2;
    scene.add(finalVizQuad);

    /// Source obj (cube)

    let sz = canvasSz / 4;
    let c_g = new THREE.BoxGeometry(sz, sz, sz);
    let c_m = new THREE.MeshLambertMaterial();
    let c = new THREE.Mesh(c_g, c_m);
    c.position.z = canvasSz/2;
    maskScene.add(c);
    let c2 = c.clone();
    scene.add(c2);
    let c3 = c.clone();
    albedoScene.add(c3);
}

function animate() {
    requestAnimationFrame(animate);
    var time = performance.now() * 0.001;
    // b.rotation.y = time * 0.2;
    render();
}

function render() {
    // Render the maskScene into maskRt tex
    renderer.setRenderTarget(maskRt);
    renderer.clear();
    renderer.render(maskScene, camera);

    // Render the maskScene into albedoRt tex
    renderer.setRenderTarget(albedoRt);
    renderer.clear();
    renderer.render(albedoScene, camera);

    // Render the final scene to screen
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(scene, camera);
}

init();
animate();