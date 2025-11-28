import { UserType } from "@/app/context/authContext";

export const LEVEL_CONFIG: Record<number, { name: string; color: string; minPoints: number; maxPoints: number }> = {
  1: { name: "Lector Principiante", color: "#10B981", minPoints: 0, maxPoints: 100 },
  2: { name: "Lector Aficionado", color: "#3B82F6", minPoints: 100, maxPoints: 250 },
  3: { name: "Lector Dedicado", color: "#F59E0B", minPoints: 250, maxPoints: 500 },
  4: { name: "Lector Experto", color: "#8B5CF6", minPoints: 500, maxPoints: 1000 },
  5: { name: "Lector Maestro", color: "#EF4444", minPoints: 1000, maxPoints: 2000 },
};

export const calculateProgressPercentage = (user: UserType): number => {
  if (!user || !user.level || typeof user.level === "string") return 0;

  const currentLevel = user.level.level || 1;
  const maxPoint = user.level.maxPoint || 100;
  const currentPoint = user.point || 0;

  const levelConfig = LEVEL_CONFIG[currentLevel] || LEVEL_CONFIG[1];
  const pointsInLevel = currentPoint - levelConfig.minPoints;
  const totalPointsForLevel = maxPoint - levelConfig.minPoints;

  if (totalPointsForLevel <= 0) return 0;

  const progress = (pointsInLevel / totalPointsForLevel) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const calculatePointsToNextLevel = (user: UserType): number => {
  if (!user || !user.level || typeof user.level === "string") return 0;

  const maxPoint = user.level.maxPoint || 100;
  const currentPoint = user.point || 0;

  const pointsToNext = maxPoint - currentPoint;
  return Math.max(0, pointsToNext);
};

export const getLevelName = (level?: number): string => {
  const levelNum = level || 1;
  return LEVEL_CONFIG[levelNum]?.name || LEVEL_CONFIG[1].name;
};

export const getLevelFrameColor = (level?: number): string => {
  const levelNum = level || 1;
  return LEVEL_CONFIG[levelNum]?.color || LEVEL_CONFIG[1].color;
};

export const getProgressMessage = (progressPercent: number): string => {
  if (progressPercent < 25) {
    return "¡Acabas de comenzar! Sigue leyendo para avanzar.";
  }
  if (progressPercent < 50) {
    return "¡Buen progreso! Ya estás a mitad de camino.";
  }
  if (progressPercent < 75) {
    return "¡Casi lo logras! Poco te falta para el siguiente nivel.";
  }
  if (progressPercent < 100) {
    return "¡Muy cerca! Unos pocos puntos más te esperan.";
  }
  return "¡Felicidades! ¡Estás listo para subir de nivel!";
};
