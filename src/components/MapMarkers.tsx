/* ... 前面的 SHARED_GEOMETRIES 和 SHARED_MATERIALS 保持不变 ... */

const TechMarker: React.FC<TechMarkerProps> = ({ 
  name, lat, lon, subtitle, height, align, companies, 
  isActive, isDimmed, onActivate, onDeactivate 
}) => {
  const position = useMemo(() => projectToVector3(lon, lat), [lon, lat]);
  const ringRef = useRef<THREE.Group>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerEnter = (e?: any) => {
    e?.stopPropagation();
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    onActivate();
  };

  const handlePointerLeave = (e?: any) => {
    e?.stopPropagation();
    hoverTimeoutRef.current = setTimeout(() => {
      onDeactivate();
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);
  
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.02;
    }
  });

  const beamZ = height / 2;
  const showDetails = isActive && companies && companies.length > 0;

  return (
    <group position={[position.x, position.y, 0]}>
      {/* 射线碰撞体 */}
      <mesh 
        position={[0, 0, beamZ]} 
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, height, 1]}
        geometry={SHARED_GEOMETRIES.hitArea}
        material={SHARED_MATERIALS.invisible}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
      />

      {/* 地面底座装饰 */}
      <group>
        <mesh 
          position={[0, 0, 0.05]} 
          geometry={SHARED_GEOMETRIES.coreCircle}
          material={showDetails ? SHARED_MATERIALS.coreActive : SHARED_MATERIALS.coreNormal}
        />
        <mesh 
          position={[0, 0, 0.02]} 
          geometry={SHARED_GEOMETRIES.diffuseRing}
          material={SHARED_MATERIALS.diffuse}
        />
        <group ref={ringRef}>
            <mesh 
              position={[0, 0, 0.03]} 
              geometry={SHARED_GEOMETRIES.outerRing}
              material={SHARED_MATERIALS.outerRing}
            />
        </group>
      </group>

      {/* 垂直光束 */}
      <group>
         <mesh 
           position={[0, 0, beamZ]} 
           rotation={[Math.PI / 2, 0, 0]}
           scale={[1, height, 1]}
           geometry={SHARED_GEOMETRIES.beamCylinder}
           material={showDetails ? SHARED_MATERIALS.beamActive : SHARED_MATERIALS.beamNormal}
         />
         <mesh 
           position={[0, 0, 0.5]} 
           rotation={[Math.PI / 2, 0, 0]}
           geometry={SHARED_GEOMETRIES.haloBase}
           material={SHARED_MATERIALS.halo}
         />
      </group>

      {/* 悬浮信息标签 - 字体调大版本 */}
      <Html 
        position={[0, 0, height]} 
        center 
        distanceFactor={12} 
        zIndexRange={showDetails ? [1000000, 1000000] : (isDimmed ? [10, 0] : [100, 0])}
        style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} 
      >
        <div 
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            className={`flex items-start transition-all duration-300 ease-in-out ${align === 'left' ? 'flex-row-reverse' : 'flex-row'}`}
            style={{ 
                pointerEvents: 'auto', 
                transform: align === 'left' 
                    ? 'translateX(-50%) translateX(-20px)' 
                    : 'translateX(50%) translateX(20px)',
                opacity: isDimmed ? 0.15 : 1, 
                filter: isDimmed ? 'grayscale(100%) blur(2px)' : 'none', 
            }}
        >
            {/* 连接线 - 稍微加长以适配大字体 */}
            <div className={`w-10 h-[1.5px] mt-4 bg-blue-500/70 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300 ${showDetails ? 'bg-blue-600 w-16' : ''}`}></div>
            
            {/* 信息卡片 */}
            <div className={`
                relative bg-white/95 backdrop-blur-2xl border-y border-blue-400/50 py-3 px-5 text-left shadow-[0_8px_30px_rgba(59,130,246,0.3)]
                transition-all duration-300 ease-out origin-top
                ${align === 'left' ? 'border-r-4 border-r-blue-500 pr-5' : 'border-l-4 border-l-blue-500 pl-5'}
                ${showDetails ? 'scale-110 z-50 min-w-[320px]' : 'scale-100 min-w-[160px]'}
            `}>
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
                
                {/* 城市名 - 调大至 text-xl */}
                <h1 className="text-xl font-black text-gray-900 leading-tight tracking-wider font-sans mb-1 drop-shadow-sm">
                    {name.toUpperCase()}
                </h1>

                {!showDetails && (
                  <div className="flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                       {/* 子标题 - 调大至 text-xs */}
                       <p className="text-xs text-blue-600 font-bold uppercase tracking-[0.2em]">
                          {subtitle}
                      </p>
                  </div>
                )}

                {showDetails && (
                  <div className="mt-3 flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400">
                    {companies.map((company, idx) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3 py-1 hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-baseline gap-2">
                          {/* 公司名 - 调大至 text-sm */}
                          <span className="text-blue-700 font-extrabold text-sm">{company.name}</span>
                          <span className="text-[10px] text-gray-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{company.type}</span>
                        </div>
                        {/* 描述 - 调大至 text-xs */}
                        <p className="text-xs text-gray-600 leading-relaxed mt-1 font-medium italic opacity-90">
                          {company.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
      </Html>
    </group>
  );
};
