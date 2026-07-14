'use client'

import { useEffect, useRef, useState } from 'react'

export default function StageExperience({ progress = 0 }) {
  const host = useRef(null)
  const progressRef = useRef(progress)
  const [ready, setReady] = useState(false)

  useEffect(() => { progressRef.current = progress }, [progress])

  useEffect(() => {
    let disposed = false
    let frame = 0
    let cleanup = () => {}

    async function mount() {
      const THREE = await import('three')
      if (disposed || !host.current) return

      const scene = new THREE.Scene()
      scene.background = new THREE.Color('#020202')
      scene.fog = new THREE.FogExp2('#020202', 0.035)

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 160)
      camera.position.set(0, 4.2, 27)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      renderer.shadowMap.enabled = window.innerWidth > 760
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.domElement.setAttribute('aria-hidden', 'true')
      host.current.appendChild(renderer.domElement)

      const world = new THREE.Group()
      scene.add(world)

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 85), new THREE.MeshStandardMaterial({ color: '#070707', roughness: 0.78, metalness: 0.22 }))
      floor.rotation.x = -Math.PI / 2
      floor.position.y = -3.5
      floor.receiveShadow = true
      world.add(floor)

      const stage = new THREE.Mesh(new THREE.BoxGeometry(18, 1.2, 8), new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.6, metalness: 0.5 }))
      stage.position.set(0, -2.9, -7)
      stage.receiveShadow = true
      world.add(stage)

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 12, 0.45), new THREE.MeshStandardMaterial({ color: '#050505', roughness: 0.92 }))
      backWall.position.set(0, 2.4, -11)
      world.add(backWall)

      const trussMaterial = new THREE.MeshStandardMaterial({ color: '#343434', roughness: 0.28, metalness: 0.88 })
      const truss = new THREE.Group()
      for (let x = -8; x <= 8; x += 2) {
        const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.15, 8, 0.15), trussMaterial)
        vertical.position.set(x, 4.8, -8.7)
        truss.add(vertical)
      }
      for (const y of [1, 8.5]) {
        const horizontal = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.15, 0.15), trussMaterial)
        horizontal.position.set(0, y, -8.7)
        truss.add(horizontal)
      }
      world.add(truss)

      const logoCanvas = document.createElement('canvas')
      logoCanvas.width = 1800
      logoCanvas.height = 700
      const ctx = logoCanvas.getContext('2d')
      ctx.clearRect(0, 0, 1800, 700)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f3ead8'
      ctx.shadowColor = 'rgba(212,160,23,.55)'
      ctx.shadowBlur = 28
      ctx.font = '900 240px Arial Narrow, Impact, sans-serif'
      ctx.fillText('ECHO PLAY', 900, 285)
      ctx.fillStyle = '#d4a017'
      ctx.shadowBlur = 42
      ctx.font = '900 185px Arial Narrow, Impact, sans-serif'
      ctx.fillText('LIVE', 900, 510)
      const logoTexture = new THREE.CanvasTexture(logoCanvas)
      logoTexture.colorSpace = THREE.SRGBColorSpace
      const logoMaterial = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      const logo = new THREE.Mesh(new THREE.PlaneGeometry(12.4, 4.8), logoMaterial)
      logo.position.set(0, 2.25, -10.7)
      world.add(logo)

      const amber = new THREE.Color('#d4a017')
      const cream = new THREE.Color('#f3ead8')
      scene.add(new THREE.AmbientLight('#382b14', 0.25))
      const key = new THREE.DirectionalLight('#f3ead8', 1.2)
      key.position.set(-4, 9, 8)
      scene.add(key)

      const lights = []
      const beamMaterial = color => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
      const fixtureXs = [-7, -3.5, 0, 3.5, 7]
      fixtureXs.forEach((x, i) => {
        const color = i % 2 ? cream : amber
        const spot = new THREE.SpotLight(color, 65, 42, 0.24, 0.62, 1.4)
        spot.position.set(x, 8.2, -7.8)
        spot.target.position.set(x * 0.35, -2.5, -4)
        spot.castShadow = window.innerWidth > 760 && i === 2
        scene.add(spot, spot.target)

        const beam = new THREE.Mesh(new THREE.ConeGeometry(2.3, 18, 24, 1, true), beamMaterial(color))
        beam.position.set(x, 0.25, -4.4)
        beam.rotation.x = Math.PI
        world.add(beam)
        lights.push({ spot, beam, phase: i * 0.85, x })
      })

      const particles = 760
      const positions = new Float32Array(particles * 3)
      for (let i = 0; i < particles; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 34
        positions[i * 3 + 1] = Math.random() * 15 - 3
        positions[i * 3 + 2] = Math.random() * 38 - 16
      }
      const dustGeo = new THREE.BufferGeometry()
      dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: '#d6c49f', size: 0.035, transparent: true, opacity: 0.48, depthWrite: false }))
      scene.add(dust)

      const crowd = new THREE.Group()
      const crowdGeo = new THREE.SphereGeometry(0.22, 8, 6)
      const crowdMat = new THREE.MeshStandardMaterial({ color: '#080808', roughness: 1 })
      for (let row = 0; row < 9; row++) {
        for (let col = -12; col <= 12; col++) {
          if (Math.random() < 0.17) continue
          const head = new THREE.Mesh(crowdGeo, crowdMat)
          head.position.set(col * 0.72 + (Math.random() - 0.5) * 0.25, -2.55 + Math.random() * 0.22, 5 + row * 1.25 + Math.random() * 0.35)
          crowd.add(head)
        }
      }
      world.add(crowd)

      const resize = () => {
        if (!host.current) return
        const { clientWidth, clientHeight } = host.current
        renderer.setSize(clientWidth, clientHeight, false)
        camera.aspect = clientWidth / Math.max(clientHeight, 1)
        camera.updateProjectionMatrix()
      }
      resize()
      window.addEventListener('resize', resize)

      const clock = new THREE.Clock()
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setReady(true)

      const animate = () => {
        const t = clock.getElapsedTime()
        const p = Math.min(1, Math.max(0, progressRef.current))
        const eased = p * p * (3 - 2 * p)
        const logoReveal = THREE.MathUtils.smoothstep(p, 0.34, 0.68)
        const finalPush = THREE.MathUtils.smoothstep(p, 0.74, 1)

        camera.position.z = THREE.MathUtils.lerp(27, 11.8, eased) + finalPush * 1.6
        camera.position.y = THREE.MathUtils.lerp(4.2, 1.4, eased) - finalPush * 0.25
        camera.position.x = reduced ? 0 : Math.sin(t * 0.17) * 0.32 * (1 - p)
        camera.lookAt(0, THREE.MathUtils.lerp(1.9, 0.7, p), -7.4)

        logoMaterial.opacity = logoReveal * (1 - finalPush * 0.42)
        logo.scale.setScalar(THREE.MathUtils.lerp(0.76, 1.04, logoReveal))
        backWall.material.color.setScalar(THREE.MathUtils.lerp(0.012, 0.055, p))

        lights.forEach((item, i) => {
          const sweep = Math.sin(t * (0.5 + i * 0.04) + item.phase)
          item.spot.target.position.x = item.x * 0.2 + sweep * 5.2
          item.spot.target.position.z = -3 + Math.cos(t * 0.38 + item.phase) * 2.4
          item.spot.intensity = 22 + p * 75 + (Math.sin(t * 1.1 + i) + 1) * 7
          item.beam.rotation.z = sweep * 0.28
          item.beam.material.opacity = 0.025 + p * 0.09
        })

        dust.rotation.y = t * 0.012
        dust.position.y = Math.sin(t * 0.2) * 0.15
        world.rotation.y = reduced ? 0 : Math.sin(t * 0.12) * 0.008
        renderer.toneMappingExposure = 0.82 + logoReveal * 0.42

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
    }

    mount()
    return () => { disposed = true; cleanup() }
  }, [])

  return <div ref={host} className={`stage-webgl ${ready ? 'is-ready' : ''}`}><div className="stage-loading">Building the room…</div></div>
}
