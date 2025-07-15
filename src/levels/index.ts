import { DataLevel, DataLevels } from '../consts/level'

import rawLevel1 from './level1.json'
import rawLevel2 from './level2.json'
import rawLevel3 from './level3.json'
import rawLevel4 from './level4.json'
import rawLevel5 from './level5.json'
import rawLevel6 from './level6.json'
import rawLevel7 from './level7.json'
import rawLevel8 from './level8.json'
import rawLevel9 from './level9.json'
import rawLevel10 from './level10.json'

export const levelsData: DataLevels = {
  level1: rawLevel1 as DataLevel,
  level2: rawLevel2 as DataLevel,
  level3: rawLevel3 as DataLevel,
  level4: rawLevel4 as DataLevel,
  level5: rawLevel5 as DataLevel,
  level6: rawLevel6 as DataLevel,
  level7: rawLevel7 as DataLevel,
  level8: rawLevel8 as DataLevel,
  level9: rawLevel9 as DataLevel,
  level10: rawLevel10 as DataLevel,
}
