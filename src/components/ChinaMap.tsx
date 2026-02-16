import React, { useMemo } from 'react';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MapMarkers } from './MapMarkers';

// 配置本地 Draco 解码器路径
// useGLTF.setDecoderPath('/draco/');
// 使用谷歌CDN
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

export const ChinaMap: React.FC = () => {
  const { scene } = useGLTF('/china-map-draco.glb');

  const mapModel = useMemo(() => {
    const cloned = scene.clone();
    const lineMaterial = new THREE.LineBasicMaterial({ color: '#1e40af', transparent: true, opacity: 0.5 });

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // 动态生成边缘线，替代导出时报错的 Edges 组件
        const edgesGeometry = new THREE.EdgesGeometry(child.geometry, 30);
        const line = new THREE.LineSegments(edgesGeometry, lineMaterial);
        child.add(line);
      }
    });
    return cloned;
  }, [scene]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <Center disableZ>
        <primitive object={mapModel} />
        <MapMarkers />
      </Center>
    </group>
  );
};

useGLTF.preload('/china-map-draco.glb');
