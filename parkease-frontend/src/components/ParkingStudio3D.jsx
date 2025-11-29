import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function ParkingStudio3D() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 4, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true // Transparent background to show your gradient
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0) // Fully transparent
    containerRef.current.appendChild(renderer.domElement)

    // DRIBBBLE-STYLE STUDIO LIGHTING (Purple + Blue)
    const ambientLight = new THREE.AmbientLight(0x9b59b6, 0.6) // Purple ambient
    scene.add(ambientLight)
    
    const pointLight1 = new THREE.PointLight(0x3498db, 1.5, 20) // Blue point light
    pointLight1.position.set(-5, 5, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xe91e63, 1.2, 20) // Pink accent
    pointLight2.position.set(5, 3, -3)
    scene.add(pointLight2)

    // REFLECTIVE FLOOR (polished look)
    const floorGeometry = new THREE.PlaneGeometry(30, 30)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    scene.add(floor)

    // Parking slot lines on floor
    const lineGeometry = new THREE.BoxGeometry(0.1, 0.05, 6)
    const lineMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffeb3b, 
      emissive: 0xffeb3b,
      emissiveIntensity: 0.5
    })
    
    const line1 = new THREE.Mesh(lineGeometry, lineMaterial)
    line1.position.set(-3, 0.03, 0)
    scene.add(line1)
    
    const line2 = new THREE.Mesh(lineGeometry, lineMaterial)
    line2.position.set(-7, 0.03, 0)
    scene.add(line2)

    // LOAD PROFESSIONAL 3D CAR MODEL
    const loader = new GLTFLoader()
    let animatedCar = null
    let isLoading = true

    loader.load(
      'https://raw.githubusercontent.com/joshuabird/threejs-car-drive-game/master/public/models/sedan.glb',
      (gltf) => {
        animatedCar = gltf.scene
        animatedCar.scale.set(1.8, 1.8, 1.8)
        
        // Apply purple/blue tint to car
        animatedCar.traverse((child) => {
          if (child.isMesh) {
            child.material.emissive = new THREE.Color(0x3498db)
            child.material.emissiveIntensity = 0.1
          }
        })
        
        scene.add(animatedCar)
        isLoading = false
      },
      undefined,
      (error) => {
        console.error('Error loading car model:', error)
        isLoading = false
        // Fallback: create a simple car shape
        createFallbackCar()
      }
    )

    // Fallback simple car if model fails to load
    function createFallbackCar() {
      const carGroup = new THREE.Group()
      
      // Car body
      const bodyGeometry = new THREE.BoxGeometry(2, 1, 4)
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3498db,
        metalness: 0.8,
        roughness: 0.2
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.5
      carGroup.add(body)
      
      // Car top
      const topGeometry = new THREE.BoxGeometry(1.6, 0.8, 2)
      const top = new THREE.Mesh(topGeometry, bodyMaterial)
      top.position.set(0, 1.3, -0.5)
      carGroup.add(top)
      
      animatedCar = carGroup
      scene.add(animatedCar)
    }

    // ANIMATION LOOP
    const clock = new THREE.Clock()
    const startPos = new THREE.Vector3(0, 0, 12)
    const turnPos = new THREE.Vector3(0, 0, 0)
    const parkPos = new THREE.Vector3(-5, 0, 0)

    function animate() {
      requestAnimationFrame(animate)

      if (animatedCar) {
        const t = (clock.getElapsedTime() % 9) / 9 // 9-second loop

        if (t < 0.4) {
          // Drive in
          animatedCar.position.lerpVectors(startPos, turnPos, t / 0.4)
          animatedCar.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, t / 0.4)
        } else if (t < 0.8) {
          // Turn and reverse into parking spot
          animatedCar.position.lerpVectors(turnPos, parkPos, (t - 0.4) / 0.4)
          animatedCar.rotation.y = THREE.MathUtils.lerp(Math.PI / 2, Math.PI, (t - 0.4) / 0.4)
        } else {
          // Parked (hold position)
          animatedCar.position.copy(parkPos)
          animatedCar.rotation.y = Math.PI
        }

        // Subtle hover effect when parked
        if (t >= 0.8) {
          animatedCar.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.05
        } else {
          animatedCar.position.y = 0
        }
      }

      // Slow camera rotation for dynamic feel
      camera.position.x = Math.cos(clock.getElapsedTime() * 0.1) * 8
      camera.position.z = Math.sin(clock.getElapsedTime() * 0.1) * 10 + 2
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      scene.clear()
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Loading 3D Scene...
          </div>
        </div>
      </div>

      {/* Info Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-2 rounded-full text-white text-sm font-semibold shadow-lg">
        🚗 Smart Parking Demo
      </div>
    </div>
  )
}
