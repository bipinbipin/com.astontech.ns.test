import { Component, OnInit } from "@angular/core";
import { AudioPlayerOptions, TNSPlayer } from 'nativescript-audio';
import * as dialogs from 'tns-core-modules/ui/dialogs';


@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {
    public isPlaying: boolean;
    public audioTrackDuration;
    public remainingDuration;
    private _player: TNSPlayer;

	
	constructor() {
		
	}

	public togglePlay() {
        this._player = new TNSPlayer();
		this._player.initFromFile({
			audioFile: '~/audio/airhorn.mp3', // ~ = app directory
			loop: false,
			completeCallback: this._trackComplete.bind(this),
			errorCallback: this._trackError.bind(this)
		}).then(() => {

			this._player.getAudioTrackDuration().then((duration) => {
				// iOS: duration is in seconds
				// Android: duration is in milliseconds
				console.log(`song duration:`, duration);
			});
		});
		if (this._player.isAudioPlaying()) {
			this._player.pause();
		} else {
			this._player.play();
		}
	}

	private _trackComplete(args: any) {
		console.log('reference back to player:', args.player);

		// iOS only: flag indicating if completed succesfully
		console.log('whether song play completed successfully:', args.flag);
	}

	private _trackError(args: any) {
		console.log('reference back to player:', args.player);
		console.log('the error:', args.error);

		// Android only: extra detail on error
		console.log('extra info on the error:', args.extra);
    }
    
    ngOnInit() {
        console.log('initializing home component.');
    }

    /***** AUDIO PLAYER *****/

  public async playAudio(filepath: string, fileType: string) {
    try {
      const playerOptions: AudioPlayerOptions = {
        audioFile: filepath,
        loop: false,
        completeCallback: async () => {
          alert('Audio file complete.');
          await this._player.dispose();
          this.isPlaying = false;
          console.log('player disposed');
        },
        errorCallback: errorObject => {
          console.log(JSON.stringify(errorObject));
          this.isPlaying = false;
        },
        infoCallback: args => {
          dialogs.alert('Info callback: ' + args.info);
          console.log(JSON.stringify(args));
        }
      };

      this.isPlaying = true;

      if (fileType === 'localFile') {
        await this._player.playFromFile(playerOptions).catch(() => {
          this.isPlaying = false;
        });
        this.isPlaying = true;
        this.audioTrackDuration = await this._player.getAudioTrackDuration();
        // start audio duration tracking
        // this._startDurationTracking(this.audioTrackDuration);
        // this._startVolumeTracking();
      } else if (fileType === 'remoteFile') {
        await this._player.playFromUrl(playerOptions).catch(() => {
          this.isPlaying = false;
        });
        this.isPlaying = true;
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  /**
   * PLAY REMOTE AUDIO FILE
   */
  public playRemoteFile() {
    console.log('playRemoteFile');
    const filepath = 'http://www.noiseaddicts.com/samples_1w72b820/2514.mp3';

    this.playAudio(filepath, 'remoteFile');
  }

  public resumePlayer() {
    console.log(JSON.stringify(this._player));
    this._player.resume();
  }

  /**
   * PLAY LOCAL AUDIO FILE from app folder
   */
  public playLocalFile() {
    let filepath = '~/audio/angel.mp3';
    this.playAudio(filepath, 'localFile');
  }

}
