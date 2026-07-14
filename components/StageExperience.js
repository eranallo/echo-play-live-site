'use client'

import { useEffect, useRef, useState } from 'react'

export default function StageExperience({ progress = 0 }) {
  const host = useRef(null)
  const progressRef = useRef(progress)
  const [status, setStatus] = useState('loading')

  useEffect(() => { progressRef.current = progress }, [progress])

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function mount() {
      try {
        const THREE = await import('three')
        if (disposed || !host.current) return

        // The original CSS placed this entire layer behind the sticky section's
        // opaque background. An inline stacking level guarantees the WebGL canvas
        // remains visible in iOS Safari and in-app browsers.
        host.current.style.zIndex = '0'

        const scene = new THREE.Scene()
        scene.background = new THREE.Color('#020202')
        scene.fog = new THREE.FogExp2('#020202', 0.034)

        const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 150)
        camera.position.set(0, 3.8, 27)

        const renderer = new THREE.WebGLRenderer({
          antialias: window.devicePixelRatio < 2,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.25 : 1.65))
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        renderer.shadowMap.enabled = window.innerWidth > 900
        renderer.domElement.setAttribute('aria-hidden', 'true')
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.inset = '0'
        renderer.domElement.style.zIndex = '0'
        host.current.appendChild(renderer.domElement)

        const world = new THREE.Group()
        scene.add(world)

        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(70, 85),
          new THREE.MeshStandardMaterial({ color: '#070707', roughness: 0.8, metalness: 0.2 })
        )
        floor.rotation.x = -Math.PI / 2
        floor.position.y = -3.5
        world.add(floor)

        const stage = new THREE.Mesh(
          new THREE.BoxGeometry(18, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.58, metalness: 0.52 })
        )
        stage.position.set(0, -2.9, -7)
        world.add(stage)

        const wallMaterial = new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.92 })
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 0.45), wallMaterial)
        backWall.position.set(0, 2.4, -11)
        world.add(backWall)

        const trussMaterial = new THREE.MeshStandardMaterial({ color: '#363636', roughness: 0.25, metalness: 0.9 })
        for (let x = -8; x <= 8; x += 2) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 8, 0.14), trussMaterial)
          bar.position.set(x, 4.8, -8.7)
          world.add(bar)
        }
        for (const y of [1, 8.5]) {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.14, 0.14), trussMaterial)
          bar.position.set(0, y, -8.7)
          world.add(bar)
        }

        const logoCanvas = document.createElement('canvas')
        logoCanvas.width = window.innerWidth < 760 ? 1100 : 1800
        logoCanvas.height = window.innerWidth < 760 ? 520 : 700
        const ctx = logoCanvas.getContext('2d')
        ctx.clearRect(0, 0, logoCanvas.width, logoCanvas.height)
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#f3ead8'
        ctx.shadowColor = 'rgba(212,160,23,.65)'
        ctx.shadowBlur = 30
        ctx.font = `900 ${window.innerWidth < 760 ? 155 : 240}px Impact, Arial Narrow, sans-serif`
        ctx.fillText('ECHO PLAY', logoCanvas.width / 2, logoCanvas.height * 0.4)
        ctx.fillStyle = '#d4a017'
        ctx.shadowBlur = 42
        ctx.font = `900 ${window.innerWidth < 760 ? 125 : 185}px Impact, Arial Narrow, sans-serif`
        ctx.fillText('LIVE', logoCanvas.width / 2, logoCanvas.height * 0.74)

        const logoTexture = new THREE.CanvasTexture(logoCanvas)
        logoTexture.colorSpace = THREE.SRGBColorSpace
        const logoMaterial = new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const logo = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 4.8), logoMaterial)
        logo.position.set(0, 2.25, -10.7)
        world.add(logo)

        scene.add(new THREE.AmbientLight('#382b14', 0.28))
        const key = new THREE.DirectionalLight('#f3ead8', 1.15)
        key.position.set(-4, 9, 8)
        scene.add(key)

        const amber = new THREE.Color('#d4a017')
        const cream = new THREE.Color('#f3ead8')
        const lights = []
        const fixtureXs = window.innerWidth < 760 ? [-5.5, -2.7, 0, 2.7, 5.5] : [-7, -3.5, 0, 3.5, 7]
        fixtureXs.forEach((x, i) => {
          const color = i % 2 ? cream : amber
          const spot = new THREE.SpotLight(color, 48, 42, 0.25, 0.65, 1.4)
          spot.position.set(x, 8.2, -7.8)
          spot.target.position.set(x * 0.3, -2.5, -4)
          scene.add(spot, spot.target)

          const beam = new THREE.Mesh(
            new THREE.ConeGeometry(2.15, 18, window.innerWidth < 760 ? 12 : 24, 1, true),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
          )
          beam.position.set(x, 0.25, -4.4)
          beam.rotation.x = Math.PI
          world.add(beam)
          lights.push({ spot, beam, phase: i * 0.85, x })
        })

        const particleCount = window.innerWidth < 760 ? 280 : 760
        const positions = new Float32Array(particleCount * 3)
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 34
          positions[i * 3 + 1] = Math.random() * 15 - 3
          positions[i * 3 + 2] = Math.random() * 38 - 16
        }
        const dustGeo = new THREE.BufferGeometry()
        dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#d6c49f', size: 0.04, transparent: true, opacity: 0.5, depthWrite: false }))
        scene.add(dust)

        const resize = () => {
          if (!host.current) return
          const width = Math.max(host.current.clientWidth, 1)
          const height = Math.max(host.current.clientHeight, 1)
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }
        resize()
        window.addEventListener('resize', resize)

        const clock = new THREE.Clock()
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        setStatus('ready')

        const animate = () => {
          if (disposed) return
          const t = clock.getElapsedTime()
          const p = Math.min(1, Math.max(0, progressRef.current))
          const eased = p * p * (3 - 2 * p)
          const logoReveal = THREE.MathUtils.smoothstep(p, 0.28, 0.62)
          const finalPush = THREE.MathUtils.smoothstep(p, 0.73, 1)

          camera.position.z = THREE.MathUtils.lerp(27, 11.5, eased) + finalPush * 1.4
          camera.position.y = THREE.MathUtils.lerp(3.8, 1.25, eased)
          camera.position.x = reduced ? 0 : Math.sin(t * 0.17) * 0.24 * (1 - p)
          camera.lookAt(0, THREE.MathUtils.lerp(1.9, 0.7, p), -7.4)

          logoMaterial.opacity = logoReveal * (1 - finalPush * 0.35)
          logo.scale.setScalar(THREE.MathUtils.lerp(0.78, 1.03, logoReveal))
          wallMaterial.color.setScalar(THREE.MathUtils.lerp(0.012, 0.055, p))

          lights.forEach((item, i) => {
            const sweep = Math.sin(t * (0.5 + i * 0.04) + item.phase)
            item.spot.target.position.x = item.x * 0.2 + sweep * 4.8
            item.spot.target.position.z = -3 + Math.cos(t * 0.38 + item.phase) * 2.1
            item.spot.intensity = 16 + p * 68 + (Math.sin(t * 1.1 + i) + 1) * 6
            item.beam.rotation.z = sweep * 0.26
            item.beam.material.opacity = 0.018 + p * 0.085
          })

          dust.rotation.y = t * 0.012
          dust.position.y = Math.sin(t * 0.2) * 0.15
          renderer.toneMappingExposure = 0.78 + logoReveal * 0.45
          renderer.render(scene, camera)
          frame = requestAnimationFrame(animate)
        }
        animate()

        cleanup = () => {
          cancelAnimationFrame(frame)
          window.removeEventListener('resize', resize)
          scene.traverse(object => {
            object.geometry?.dispose?.()
            if (Array.isArray(object.material)) object.material.forEach(material => material.dispose?.())
            else object.material?.dispose?.()
          })
          logoTexture.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        }
      } catch (error) {
        console.error('Echo Play WebGL stage failed to initialize', error)
        if (!disposed) setStatus('fallback')
      }
    }

    mount()
    return () => { disposed = true; cleanup() }
  }, [])

  return (
    <div ref={host} className={`stage-webgl ${status === 'ready' ? 'is-ready' : ''} ${status === 'fallback' ? 'is-fallback' : ''}`}>
      <div className="stage-fallback" aria-hidden="true">
        <div className="stage-fallback-beam beam-one" />
        <div className="stage-fallback-beam beam-two" />
        <div className="stage-fallback-logo"><strong>ECHO PLAY</strong><span>LIVE</span></div>
      </div>
      <div className="stage-loading">{status === 'fallback' ? 'Visual mode active' : 'Building the room…'}</div>
      <style>{`
        .stage-fallback{position:absolute;inset:0;z-index:0;overflow:hidden;background:radial-gradient(circle at 50% 46%,rgba(212,160,23,.13),transparent 30%),linear-gradient(#020202,#050505);opacity:1;transition:opacity .7s ease}.stage-webgl.is-ready .stage-fallback{opacity:0}.stage-fallback-beam{position:absolute;top:-25%;width:20%;height:125%;background:linear-gradient(rgba(243,234,216,.16),transparent 75%);filter:blur(16px);transform-origin:top;animation:fallbackSweep 7s ease-in-out infinite alternate}.beam-one{left:18%;transform:rotate(-16deg)}.beam-two{right:18%;transform:rotate(16deg);animation-delay:-3s}.stage-fallback-logo{position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);text-align:center;font-family:var(--ff-display);line-height:.76;text-transform:uppercase;filter:drop-shadow(0 0 28px rgba(212,160,23,.28));opacity:.5}.stage-fallback-logo strong{display:block;font-size:clamp(50px,12vw,150px);white-space:nowrap;color:#f3ead8}.stage-fallback-logo span{display:block;font-size:clamp(42px,9vw,110px);color:#d4a017}.stage-loading{z-index:2;pointer-events:none}.stage-webgl.is-ready .stage-loading{opacity:0}@keyframes fallbackSweep{to{transform:rotate(12deg) translateX(18vw)}}
      `}</style>
    </div>
  )
}
