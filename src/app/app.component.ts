import { Component, OnInit } from "@angular/core";
import { isAndroid } from "tns-core-modules/platform";
import * as Firebase from 'nativescript-plugin-firebase';
import { messaging } from "nativescript-plugin-firebase/messaging";

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        this.registerForPush();
        this.registerForInteractivePush();
        this.pushMessageCallback();

    }

    getIconSource(icon: string): string {
        const iconPrefix = isAndroid ? "res://" : "res://tabIcons/";

        return iconPrefix + icon;
    }

    pushMessageCallback() {
        Firebase.addOnMessageReceivedCallback((message: Firebase.Message) => {
            console.log(`Title: ${message.title}`);
            console.log(`Body: ${message.body}`);
            // if your server passed a custom property called 'foo', then do this:
            console.log(`Value of 'foo': ${message.data.foo}`);
    
        });
    }

    registerForPush() {
        Firebase.init({
          onPushTokenReceivedCallback: (token: string): void => {
            console.log('registerForPush', 'Firebase plugin received a push token: ' + token);
          },
    
          // Whether you want this plugin to automatically display the notifications or just notify the callback.
          // Currently used in iOS only. Default true.
          showNotifications: true,
    
          // Keeps the push notification even after app is opened.
          autoClearBadge: true,
    
          // Whether you want this plugin to always handle the notifications when the app is in foreground.
          // Currently used in iOS only. Default false.
          showNotificationsWhenInForeground: true
        }).then(
          () => {
            console.log('registerForPush', 'Registered for push');
          },
          error => console.error('registerForPush', 'Could not register for push', error)
        );
    }

    registerForInteractivePush() {
        const model = new messaging.PushNotificationModel();
        model.iosSettings = new messaging.IosPushSettings();
        model.iosSettings.badge = false;
        model.iosSettings.alert = true;

        model.iosSettings.interactiveSettings = new messaging.IosInteractivePushSettings();
        model.iosSettings.interactiveSettings.actions = [
        // {
        //     identifier: "OPEN_ACTION",
        //     title: "Open the app (if closed)",
        //     options: messaging.IosInteractiveNotificationActionOptions.foreground
        // },
        // {
        //     identifier: "AUTH",
        //     title: "Open the app, but only if device is not locked with a passcode",
        //     options: messaging.IosInteractiveNotificationActionOptions.foreground | messaging.IosInteractiveNotificationActionOptions.authenticationRequired
        // },
        // {
        //     identifier: "INPUT_ACTION",
        //     title: "Tap to reply without opening the app",
        //     type: "input",
        //     submitLabel: "Fire!",
        //     placeholder: "Load the gun..."
        // },
        // {
        //     identifier: "INPUT_ACTION",
        //     title: "Tap to reply and open the app",
        //     options: messaging.IosInteractiveNotificationActionOptions.foreground,
        //     type: "input",
        //     submitLabel: "OK, send it",
        //     placeholder: "Type here, baby!"
        // },
        // {
        //     identifier: "DELETE_ACTION",
        //     title: "Delete without opening the app",
        //     options: messaging.IosInteractiveNotificationActionOptions.destructive
        // }

        {
            identifier: "INPUT_ACTION_FOR",
            title: "I'm for it.",
            options: messaging.IosInteractiveNotificationActionOptions.foreground,
            type: "button"
        },
        {
            identifier: "INPUT_ACTION_AGAINST",
            title: "I'm against it.",
            options: messaging.IosInteractiveNotificationActionOptions.foreground,
            type: "button"
        },
        {
            identifier: "INPUT_ACTION_CUSTOM",
            title: "I have different opinion.",
            options: messaging.IosInteractiveNotificationActionOptions.foreground,
            type: "input",
            submitLabel: "Send",
            placeholder: "My thoughts are..."
        }
        ];

        model.iosSettings.interactiveSettings.categories = [{
            identifier: "GENERAL"
        }];

        model.onNotificationActionTakenCallback = (actionIdentifier: string, message: Firebase.Message) => {
            console.log(`onNotificationActionTakenCallback fired! Message: ${JSON.stringify(message)}, Action taken: ${actionIdentifier}`);

            var response;
            switch(actionIdentifier) {
                case 'INPUT_ACTION_FOR': 
                    response = 'FOR'
                    break;
                
                case 'INPUT_ACTION_AGAINST':
                    response = 'AGAINST'
                    break;
            }
            console.log(`You are ${response} this issue. Survey ID: ${message.data.survey_id}`);
        };

        Firebase.registerForInteractivePush(model);
    }

}
