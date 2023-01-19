Outline complex shapes example for threejs
====

![info diagram](https://github.com/mccap079/threejs-basic-outlines-example/blob/master/info.png?raw=true)

Description
----

A super-simple example demonstrating how to generate an outline of complex shapes using an edge detection shader in a moduled threejs environment

Silhouette outline only-- no inside lines

Edge detection core logic (src/edge_frag.js and src/edgeAlbedo_frag.js) copypasted and minorly adapted from [here](https://io7m.com/documents/outline-glsl/#d0e175)

Click + drag scene to control camera position

Control outline thickness using the `LINE_WEIGHT` var in the frag shaders

Setup
----
1. Clone repo
2. cd to repo root
3. `$ npm i` to install pkgs (threejs, webpack, webpack-cli, webpack-dev-server)
4. `$npm run dev` to run the example via localhost
