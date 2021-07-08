/**
 * Plugin:  
 * Description: 
 * Author(s): 
 * 
 * 
 * Features:
 * Send all epic artifact to a level 6 spacetime rip
 * 
 
 * Todo:
 */


class Plugin {
  constructor() {

  }

  /**
   * Called when plugin is launched with the "run" button.
   */
  async render(container) {
    this.collectArtifacts()
  }

  collectArtifacts() {
    this.gatherArtifacts()
    this.withdrawArtifacts()
  }

  gatherArtifacts() {
    let foundriesWithArtifacts = df.getMyPlanets().filter(p => p.heldArtifactIds.length > 0 && p.planetType == 2)

    for(let i = 0; i < foundriesWithArtifacts.length; i++) {
      let foundry = foundriesWithArtifacts[i];
      let artifacts = this.artifactFilter(df.getArtifactsWithIds(foundry.heldArtifactIds))
      if (artifacts.length == 0) { continue; }

      let eligibleRips = this.eligibleRips()
      let inRangeEligibleRips = this.getPlanetsInRange(foundry, eligibleRips, 85);

      inRangeEligibleRips.sort((r1, r2) => {
        if (r1.planetLevel > r2.planetLevel) {
          return -1;
        } else if (r1.planetLevel == r2.planetLevel) {
          let r1Dist = df.getDist(foundry.locationId, r1.locationId);
          let r2Dist = df.getDist(foundry.locationId, r2.locationId);
          if (r1Dist < r2Dist) {
            return -1;
          } else {
            return 1;
          }
        } else {
          return 1;
        }
      });

      if (inRangeEligibleRips[0]) {
        let rip = inRangeEligibleRips[0];
        let energyNeeded = Math.ceil(df.getEnergyNeededForMove(foundry.locationId, rip.locationId, 1) * 1.005);

        df.terminal.current.println("Withdrawing " + rip.silver);
        df.move(foundry.locationId, inRangeEligibleRips[0].locationId, energyNeeded, 0, artifacts[0].id)
        ui.centerPlanet(foundry);
      }
    }
  }

  withdrawArtifacts() {
    let eligibleRips = this.eligibleRips().filter(r => r.heldArtifactIds.length > 0)

    for(let i = 0; i < eligibleRips.length; i++) {
      let rip = eligibleRips[i];
      let artifacts = this.artifactFilter(df.getArtifactsWithIds(rip.heldArtifactIds));
      for(let j = 0; j < artifacts.length; j++) {
        let artifact = artifacts[j];
        df.withdrawArtifact(rip.locationId, artifact.id);
      }
    }
  }

  artifactFilter(artifacts) {
    return artifacts.filter(a =>
        (a.artifactType == 5 || a.artifactType == 6 || a.artifactType == 7 || a.artifactType == 8) &&
        a.rarity >= 2 &&
        a.rarity <= 4
    );
  }

  eligibleRips() {
    return df.getMyPlanets()
        .filter(p => (
            p.planetType == 3 &&
            ui.isOwnedByMe(p) &&
            p.planetLevel > 2
        ));
  }

  getPlanetsInRange(fromPlanet, toPlanets, sendingPercent) {
    const maxDist = df.getMaxMoveDist(fromPlanet.locationId, sendingPercent);
    return toPlanets.filter(toPlanet => df.getDist(fromPlanet.locationId, toPlanet.locationId) < maxDist)
  }

  /**
   * Called when plugin modal is closed.
   */
  destroy() { }
}

/**
 * And don't forget to register it!
 */
export default Plugin;
