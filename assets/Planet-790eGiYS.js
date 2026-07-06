import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{H as t,_ as n,a as r,c as i,f as a,i as o,r as s,s as c,t as l,z as u}from"./react-three-8FxPOVlt.js";var d=e(t(),1),f=u();function p(){let{progress:e}=c();return(0,f.jsx)(i,{center:!0,children:(0,f.jsxs)(`div`,{className:`flex flex-col items-center`,children:[(0,f.jsx)(`span`,{className:`w-8 h-8 border-2 border-[#804dee] border-t-transparent rounded-full animate-spin`}),(0,f.jsxs)(`p`,{className:`text-[#aaa6c3] text-xs mt-3 font-medium`,children:[e.toFixed(0),`%`]})]})})}function m(){return(0,f.jsx)(`primitive`,{object:r(`/planet/scene.gltf`).scene,scale:2.5,"position-y":0,"rotation-y":0})}function h(){return(0,f.jsxs)(`mesh`,{scale:3.05,children:[(0,f.jsx)(`sphereGeometry`,{args:[1,64,64]}),(0,f.jsx)(`shaderMaterial`,{transparent:!0,blending:2,side:1,depthWrite:!1,uniforms:{glowColor:{value:new n(`#e4ff9e`)}},vertexShader:`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vPosition = mv.xyz;
            gl_Position = projectionMatrix * mv;
          }
        `,fragmentShader:`
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform vec3 glowColor;
          void main() {
            vec3 viewDir = normalize(-vPosition);
            float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.4);
            gl_FragColor = vec4(glowColor, fresnel * 0.75);
          }
        `})]})}function g(){return(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(`ambientLight`,{intensity:.5}),(0,f.jsx)(`hemisphereLight`,{args:[`#f2f0ea`,`#101012`,.65]}),(0,f.jsx)(`directionalLight`,{position:[5,3,5],intensity:2.3,color:`#ffffff`}),(0,f.jsx)(`pointLight`,{position:[-6,2,-3],intensity:2.2,color:`#ccff00`,distance:40}),(0,f.jsx)(`pointLight`,{position:[4,-3,2],intensity:1.1,color:`#9db4ff`,distance:30}),(0,f.jsx)(s,{radius:80,depth:50,count:2200,factor:4,saturation:0,fade:!0,speed:.6}),(0,f.jsx)(h,{}),(0,f.jsx)(m,{})]})}function _(){return(0,f.jsx)(a,{shadows:!0,frameloop:`always`,dpr:[1,2],gl:{preserveDrawingBuffer:!0,antialias:!0},camera:{fov:42,near:.1,far:300,position:[-3.5,2.2,7.5]},children:(0,f.jsxs)(d.Suspense,{fallback:(0,f.jsx)(p,{}),children:[(0,f.jsx)(o,{autoRotate:!0,autoRotateSpeed:1.6,enableZoom:!1,enablePan:!1,maxPolarAngle:Math.PI/2,minPolarAngle:Math.PI/2}),(0,f.jsx)(g,{}),(0,f.jsx)(l,{all:!0})]})})}r.preload(`/planet/scene.gltf`);export{_ as default};