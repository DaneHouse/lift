/**
 * Library ids logged by time instead of reps (planks, carries, static holds). Everything else in
 * the dataset is logged by reps, except the cardio category. Curated by hand, not guessed from names.
 */
export const timedExerciseIds = new Set([
  '3544', // bodyweight incline side plank
  '3665', // power point plank
  '2135', // weighted front plank
  '0705', // side bridge v. 2
  '1297', // isometric chest squeeze
  '3419', // l-sit on floor
  '2133', // farmers walk
  '3548', // dumbbell single arm overhead carry
  '0020', // balance board
  // Static stretches are held for time. Dynamic or loaded ones (world greatest stretch, weighted
  // stretch lunge, iron cross, rocking frog, knee circles) stay on reps.
  '1512', // all fours squad stretch
  '1708', // assisted lying calves stretch
  '1709', // assisted lying glutes stretch
  '1710', // assisted lying gluteus and piriformis stretch
  '1713', // assisted prone lying quads stretch
  '1714', // assisted prone rectus femoris stretch
  '1716', // assisted seated pectoralis major stretch with stability ball
  '1712', // assisted side lying adductor stretch
  '1405', // back pec stretch
  '1259', // behind head chest stretch
  '1407', // calf push stretch with hands against wall
  '1377', // calf stretch with hands against wall
  '1378', // calf stretch with rope
  '1548', // chair leg extended stretch
  '1271', // chest and front of shoulder stretch
  '1272', // chest stretch with exercise ball
  '1559', // exercise ball hip flexor stretch
  '1339', // exercise ball lat stretch
  '1341', // exercise ball lower back stretch (pyramid)
  '1342', // exercise ball lying side lat stretch
  '1560', // exercise ball seated hamstring stretch
  '1745', // exercise ball seated triceps stretch
  '1511', // hamstring stretch
  '1564', // intermediate hip flexor and quad stretch
  '1346', // kneeling lat stretch
  '1576', // leg up hamstring stretch
  '0613', // lying (side) quads stretch
  '1403', // neck side stretch
  '0643', // overhead triceps stretch
  '1388', // peroneals stretch
  '1389', // posterior tibialis stretch
  '0669', // rear deltoid stretch
  '2208', // roller back stretch
  '2205', // roller hip lat stretch
  '2202', // roller hip stretch
  '2207', // roller side lat stretch
  '1585', // runners stretch
  '1390', // seated calf stretch (male)
  '1424', // seated glute stretch
  '0690', // seated lower back stretch
  '2567', // seated piriformis stretch
  '1358', // side lying floor stretch
  '0716', // side push neck stretch
  '0721', // side wrist pull stretch
  '1363', // spine stretch
  '1398', // standing calves calf stretch
  '1599', // standing hamstring and calf stretch with strap
  '0794', // standing lateral stretch
  '0817', // triceps stretch
  '1365', // upper back stretch
]);

export function libraryMode(id: string, category: string) {
  if (category === 'cardio') return 'cardio' as const;
  return timedExerciseIds.has(id) ? ('time' as const) : ('reps' as const);
}
