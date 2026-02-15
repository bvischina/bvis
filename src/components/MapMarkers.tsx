import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { projectToVector3 } from '../utils/geo';

// --- 接口定义 ---
interface Company {
  name: string;
  type: string;
  desc: string;
}

interface MarkerData {
  name: string;
  lat: number;
  lon: number;
  subtitle: string;
  height: number;
  align: 'left' | 'right';
  companies?: Company[];
}

interface TechMarkerProps extends MarkerData {
  isActive: boolean;
  isDimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}

// --- 数据配置 ---
const TARGET_CITIES: MarkerData[] = [
  { 
    name: 'Beijing', lat: 39.9042, lon: 116.4074, subtitle: 'Capital City', height: 5.5, align: 'right',
    companies: [
      { name: 'Xiaomi', type: 'Electronics', desc: 'Smartphones & IoT ecosystem giant.' },
      { name: 'JD.com', type: 'E-commerce', desc: 'Supply chain & logistics innovator.' },
      { name: 'Lenovo', type: 'Technology', desc: 'Global PC & infrastructure leader.' },
      { name: 'Baidu', type: 'AI & Search', desc: 'Autonomous driving & search engine.' }
    ]
  },
  { 
    name: 'Shanghai', lat: 31.2304, lon: 121.4737, subtitle: 'Financial Hub', height: 9, align: 'right',
    companies: [
      { name: 'SAIC VW', type: 'Automotive', desc: 'Shanghai Volkswagen Automotive.' },
      { name: 'Baosteel', type: 'Materials', desc: 'Iron and steel conglomerate.' },
      { name: 'SAIC-GM', type: 'Automotive', desc: 'Joint venture in mobility innovation.' }
    ]
  },
  { 
    name: 'Suzhou', lat: 31.2989, lon: 120.5853, subtitle: 'High-Tech Zone', height: 4, align: 'left',
    companies: [
      { name: 'Ecovacs', type: 'Robotics', desc: 'Service robotics & smart home.' },
      { name: 'iFlytek', type: 'AI', desc: 'Intelligent speech & AI processing.' },
      { name: 'AUO', type: 'Display', desc: 'AU Optronics display solutions.' },
      { name: 'Huawei', type: 'R&D', desc: 'ICT infrastructure research center.' }
    ]
  },
  { 
    name: 'Hangzhou', lat: 30.2741, lon: 120.1551, subtitle: 'Digital Center', height: 6.5, align: 'right',
    companies: [
      { name: 'Alibaba', type: 'Tech Giant', desc: 'Global e-commerce & cloud computing.' },
      { name: 'Geely', type: 'Automotive', desc: 'Mobility technology & EV innovation.' },
      { name: 'NetEase', type: 'Internet', desc: 'Content, gaming & communications.' }
    ]
  },
  { 
    name: 'Shenzhen', lat: 22.5431, lon: 114.0579, subtitle: 'Innovation Core', height: 8.5, align: 'right',
    companies: [
      { name: 'Tencent', type: 'Internet', desc: 'Social, gaming & fintech giant.' },
      { name: 'DJI', type: 'Robotics', desc: 'World leader in civilian drones.' },
      { name: 'Ping An', type: 'Finance', desc: 'Tech-powered financial services.' }
    ]
  },
  { 
    name: 'Guangzhou', lat: 23.1291, lon: 113.2644, subtitle: 'Southern Gate', height: 4.5, align: 'left',
    companies: [{ name: 'Midea', type: 'Appliances', desc: 'Smart home appliances & HVAC.' }]
  },
  { 
    name: 'Chengdu', lat: 30.5728, lon: 104.0668, subtitle: 'Western Hub', height: 5.5, align: 'left',
    companies: [
      { name: 'FAW Toyota', type: 'Automotive', desc: 'Vehicle manufacturing base.' },
      { name: 'Volvo', type: 'Automotive', desc: 'Premium car manufacturing.' }
    ]
  },
  { 
    name: 'Chongqing', lat: 29.5630, lon: 106.5516, subtitle: 'Mountain City', height: 3.5, align: 'left',
    companies: [{ name: 'Jiangxiaobai', type: 'Beverage', desc: 'Youth-focused sorghum spirits.' }]
  }
];

// --- 预编译共享资源 ---
const SHARED_GEOMETRIES = {
  hitArea: new THREE.CylinderGeometry(1.2, 1.2, 1, 8),
  coreCircle: new THREE.CircleGeometry(0.18, 32),
  diffuseRing: new THREE.RingGeometry(0.25, 0.45, 32),
  outerRing: new THREE.RingGeometry(0.55, 0.62, 32, 1, 0, Math.PI * 1.5),
  beamCylinder: new THREE.CylinderGeometry(0.04, 0.04, 1, 8),
  haloBase: new THREE.CylinderGeometry(0.12, 0.0, 1, 8),
};

const SHARED_MATERIALS = {
  coreNormal: new THREE.MeshBasicMaterial({ color: "#3b82f6" }),
  coreActive: new THREE.MeshBasicMaterial({ color: "#ef4444" }),
  diffuse: new THREE.MeshBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.5 }),
  outerRing: new THREE.MeshBasicMaterial({ color: "#2563eb", transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
  beamNormal: new THREE.MeshBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.9 }),
  beamActive: new THREE.MeshBasicMaterial({ color: "#3b82f6", transparent: true, opacity: 0.9 }),
  halo: new THREE.MeshBasicMaterial({ color: "#60a5fa", transparent: true, opacity: 0.4, depthWrite: false }),
  invisible: new THREE.MeshBasicMaterial({ visible: false })
};

// --- 子组件: 标记点 ---
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
      {/* 交互热区 */}
      <mesh 
        position={[0, 0, beamZ]} 
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, height, 1]}
        geometry={SHARED_GEOMETRIES.hitArea}
        material={SHARED_MATERIALS.invisible}
        onPointerOver={handlePointerEnter}
        onPointerOut={handlePointerLeave}
      />

      {/* 地面底座 */}
      <group>
        <mesh position={[0, 0, 0.05]} geometry={SHARED_GEOMETRIES.coreCircle} material={showDetails ? SHARED_MATERIALS.coreActive : SHARED_MATERIALS.coreNormal} />
        <mesh position={[0, 0, 0.02]} geometry={SHARED_GEOMETRIES.diffuseRing} material={SHARED_MATERIALS.diffuse} />
        <group ref={ringRef}>
            <mesh position={[0, 0, 0.03]} geometry={SHARED_GEOMETRIES.outerRing} material={SHARED_MATERIALS.outerRing} />
        </group>
      </group>

      {/* 垂直引线 */}
      <group>
         <mesh 
           position={[0, 0, beamZ]} 
           rotation={[Math.PI / 2, 0, 0]}
           scale={[1, height, 1]}
           geometry={SHARED_GEOMETRIES.beamCylinder}
           material={showDetails ? SHARED_MATERIALS.beamActive : SHARED_MATERIALS.beamNormal}
         />
         <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]} geometry={SHARED_GEOMETRIES.haloBase} material={SHARED_MATERIALS.halo} />
      </group>

      {/* 悬浮标签 (大字体优化版) */}
      <Html 
        position={[0, 0, height]} 
        center 
        distanceFactor={10} 
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
                opacity: isDimmed ? 0.2 : 1, 
                filter: isDimmed ? 'grayscale(100%) blur(1px)' : 'none', 
            }}
        >
            {/* 连接横线 */}
            <div className={`w-12 h-[2px] mt-4 bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all duration-300 ${showDetails ? 'bg-blue-600 w-16' : ''}`}></div>
            
            {/* 信息主体 */}
            <div className={`
                relative bg-white/95 backdrop-blur-2xl border-y border-blue-400/50 py-3 px-5 text-left shadow-[0_10px_40px_rgba(59,130,246,0.35)]
                transition-all duration-300 ease-out origin-top
                ${align === 'left' ? 'border-r-[6px] border-r-blue-600 pr-6' : 'border-l-[6px] border-l-blue-600 pl-6'}
                ${showDetails ? 'scale-110 z-50 min-w-[340px]' : 'scale-100 min-w-[180px]'}
            `}>
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                
                {/* 城市大标题 */}
                <h1 className="text-2xl font-black text-gray-900 leading-none tracking-wider font-sans mb-1.5 drop-shadow-sm">
                    {name.toUpperCase()}
                </h1>

                {!showDetails && (
                  <div className="flex items-center gap-2.5">
                       <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                       <p className="text-xs text-blue-600 font-bold uppercase tracking-[0.25em]">
                          {subtitle}
                      </p>
                  </div>
                )}

                {showDetails && (
                  <div className="mt-4 flex flex-col gap-4 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-400">
                    {companies.map((company, idx) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-4 py-1.5 hover:border-blue-500 transition-colors group">
                        <div className="flex justify-between items-baseline gap-3">
                          <span className="text-blue-700 font-extrabold text-base group-hover:text-blue-600 transition-colors">{company.name}</span>
                          <span className="text-[11px] font-bold text-gray-600 bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200 uppercase">{company.type}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mt-1.5 font-medium opacity-90">
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

// --- 主导出组件 ---
export const MapMarkers: React.FC = () => {
  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  return (
    <group position={[0, 0, 1.25]}> 
      {TARGET_CITIES.map((city) => (
        <TechMarker 
            key={city.name} 
            {...city}
            isActive={activeMarker === city.name}
            isDimmed={activeMarker !== null && activeMarker !== city.name}
            onActivate={() => setActiveMarker(city.name)}
            onDeactivate={() => setActiveMarker((prev) => prev === city.name ? null : prev)}
        />
      ))}
    </group>
  );
};
