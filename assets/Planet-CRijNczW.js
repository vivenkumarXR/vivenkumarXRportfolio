import{a as e}from"./rolldown-runtime-Cyuzqnbw.js";import{a as t,c as n,d as r,h as i,l as a,o,p as s,r as c,s as l,t as u,u as d}from"./react-three-CE_yHwMk.js";var f=e(i(),1),p=s();function m(){let{progress:e}=l();return(0,p.jsx)(n,{center:!0,children:(0,p.jsxs)(`div`,{className:`flex flex-col items-center`,children:[(0,p.jsx)(`span`,{className:`w-8 h-8 border-2 border-[#804dee] border-t-transparent rounded-full animate-spin`}),(0,p.jsxs)(`p`,{className:`text-[#aaa6c3] text-xs mt-3 font-medium`,children:[e.toFixed(0),`%`]})]})})}function h(){return(0,p.jsx)(`primitive`,{object:o(`/planet/scene.gltf`).scene,scale:2.5,"position-y":0,"rotation-y":0})}function g(){return(0,p.jsxs)(`mesh`,{ref:(0,f.useRef)(null),scale:3.05,children:[(0,p.jsx)(`sphereGeometry`,{args:[1,64,64]}),(0,p.jsx)(`shaderMaterial`,{transparent:!0,blending:2,side:1,depthWrite:!1,uniforms:{glowColor:{value:new r(`#6c8cff`)}},vertexShader:`
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
            float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.2);
            gl_FragColor = vec4(glowColor, fresnel * 0.9);
          }
        `})]})}function _(){return(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(`ambientLight`,{intensity:.55}),(0,p.jsx)(`hemisphereLight`,{args:[`#bfd4ff`,`#1a1030`,.7]}),(0,p.jsx)(`directionalLight`,{position:[5,3,5],intensity:2.2,color:`#fff2e0`}),(0,p.jsx)(`pointLight`,{position:[-6,2,-3],intensity:2.5,color:`#804dee`,distance:40}),(0,p.jsx)(`pointLight`,{position:[4,-3,2],intensity:1.4,color:`#00d9f5`,distance:30}),(0,p.jsx)(c,{radius:80,depth:50,count:2500,factor:4,saturation:0,fade:!0,speed:.6}),(0,p.jsx)(g,{}),(0,p.jsx)(h,{})]})}function v(){return d(()=>{}),null}function y(){return(0,p.jsx)(a,{shadows:!0,frameloop:`always`,dpr:[1,2],gl:{preserveDrawingBuffer:!0,antialias:!0},camera:{fov:42,near:.1,far:300,position:[-3.5,2.2,7.5]},children:(0,p.jsxs)(f.Suspense,{fallback:(0,p.jsx)(m,{}),children:[(0,p.jsx)(t,{autoRotate:!0,autoRotateSpeed:.7,enableZoom:!1,enablePan:!1,maxPolarAngle:Math.PI/2,minPolarAngle:Math.PI/2}),(0,p.jsx)(_,{}),(0,p.jsx)(v,{}),(0,p.jsx)(u,{all:!0})]})})}o.preload(`/planet/scene.gltf`);export{y as default};