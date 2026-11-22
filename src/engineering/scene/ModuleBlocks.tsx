import { useMemo, useRef, useState, type MutableRefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  MODULAR_NODES,
  MODULE_COLORS,
  getModuleTransform,
  type KitModuleId,
  type ModuleNode,
} from "../scene-config";

type Props = {
  progressRef: MutableRefObject<number>;
  reducedMotion: boolean;
  activeModule: KitModuleId | null;
  onSelect: (id: KitModuleId) => void;
};

function BlockGeometry({ shape }: { shape: ModuleNode["shape"] }) {
  if (shape === "cube") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "prism") return <cylinderGeometry args={[0.62, 0.62, 1, 3]} />;
  return <torusGeometry args={[0.6, 0.24, 12, 28]} />;
}

export default function ModuleBlocks({
  progressRef,
  reducedMotion,
  activeModule,
  onSelect,
}: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);

  // Drive every block from the shared scroll + clock, with no per-frame allocs.
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const scroll = progressRef.current;
    for (let i = 0; i < MODULAR_NODES.length; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const { position, quaternion, scale } = getModuleTransform(
        MODULAR_NODES[i],
        scroll,
        t,
        reducedMotion,
      );
      mesh.position.copy(position);
      mesh.quaternion.copy(quaternion);
      mesh.scale.setScalar(scale);
    }
  });

  const materialProps = useMemo(
    () =>
      MODULAR_NODES.map((node) => {
        const color = MODULE_COLORS[node.moduleId];
        const frosted = node.finish === "frosted";
        const accent = node.finish === "accent";
        return {
          color,
          emissive: color,
          roughness: frosted ? 0.1 : accent ? 0.3 : 0.55,
          metalness: accent ? 0.2 : 0.1,
          transparent: frosted,
          opacity: frosted ? 0.62 : 1,
        };
      }),
    [],
  );

  return (
    <group>
      {MODULAR_NODES.map((node, i) => {
        const isActive = activeModule === node.moduleId;
        const isHovered = hovered === i;
        const mat = materialProps[i];
        return (
          <mesh
            key={node.index}
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            castShadow
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              e.stopPropagation();
              setHovered(i);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered((h) => (h === i ? null : h));
              document.body.style.cursor = "";
            }}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation();
              onSelect(node.moduleId);
            }}
          >
            <BlockGeometry shape={node.shape} />
            <meshStandardMaterial
              color={mat.color}
              emissive={mat.emissive}
              emissiveIntensity={isHovered ? 0.9 : isActive ? 0.5 : node.finish === "accent" ? 0.35 : 0.08}
              roughness={mat.roughness}
              metalness={mat.metalness}
              transparent={mat.transparent}
              opacity={mat.opacity}
              flatShading={node.shape !== "ring"}
            />
          </mesh>
        );
      })}
    </group>
  );
}
