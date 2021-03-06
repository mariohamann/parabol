/*
 * Make a list of all the entities mentioned across all the reflections
 */

import GoogleAnalyzedEntity from 'parabol-server/database/types/GoogleAnalyzedEntity'
const getAllLemmasFromReflections = (reflectionEntities: GoogleAnalyzedEntity[][] = []) => {
  const lemmaSet = new Set<string>()
  for (let jj = 0; jj < reflectionEntities.length; jj++) {
    const entities = reflectionEntities[jj]
    if (!Array.isArray(entities)) continue
    for (let ii = 0; ii < entities.length; ii++) {
      const entity = entities[ii]
      const {lemma} = entity
      if (lemma) {
        lemmaSet.add(lemma)
      }
    }
  }
  return Array.from(lemmaSet)
}

export default getAllLemmasFromReflections
