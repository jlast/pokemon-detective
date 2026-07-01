import type { Suspect } from "../../game/caseModel";

interface MugShotProps {
    suspect: Suspect;
}

export function MugShot({ suspect }: MugShotProps) {
    return (        <div className="suspect-sprite-frame">
          <img
            className="suspect-sprite"
            src={suspect.sprite}
            alt={suspect.name}
            loading="lazy"
          />
        </div>)
};