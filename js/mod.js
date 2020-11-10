let modInfo = {
	name: "Prestige Tree Rewritten",
	id: "ptr",
	author: "Jacorb (Despacit helped port)",
	pointsName: "points",
	discordName: "PT Rewritten Server",
	discordLink: "https://discord.gg/TFCHJJT",
	changelogLink: "https://github.com/AbitofTetration/Prestige-Tree-Rewritten/blob/master/changelog.md",
    offlineLimit: 1,  // In hours
    initialStartPoints: new Decimal(10), // Used for hard resets and new players
	endgame: new Decimal("1e9999999999"),
	specialEndgameText: 'v0.4 Beta 6 Endgame: e16,875 Points, 1e150 Quirk Energy',
}

// Set your version in num and name
let VERSION = {
	num: "0.4",
	beta: 6,
	name: "Hindered Quirkiness",
}

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["doReset", "buy", "onPurchase", "blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("p", 11);
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	if (hasUpgrade("p", 12)) gain = gain.times(upgradeEffect("p", 12));
	if (hasUpgrade("p", 13)) gain = gain.times(upgradeEffect("p", 13));
	if (hasUpgrade("p", 22)) gain = gain.times(upgradeEffect("p", 22));
	if (hasAchievement("a", 21)) gain = gain.times(1.1);
	if (hasAchievement("a", 31)) gain = gain.times(1.5);
	if (inChallenge("h", 22)) return gain.times(player.s.unlocked?buyableEffect("s", 11):1).root(inChallenge("h", 31)?tmp.h.pointRoot31:1);
	
	if (player.b.unlocked) gain = gain.times(tmp.b.effect);
	if (player.g.unlocked) gain = gain.times(tmp.g.powerEff);
	if (player.t.unlocked) gain = gain.times(tmp.t.enEff);
	if (player.s.unlocked) gain = gain.times(buyableEffect("s", 11));
	if (player.h.unlocked) gain = gain.times(tmp.h.effect);
	if (player.q.unlocked) gain = gain.times(tmp.q.enEff);
	
	if (inChallenge("h", 31)) gain = gain.root(tmp.h.pointRoot31);
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(modInfo.endgame)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600000) // Default is 1 hour which is just arbitrarily large
}

// Variables that must be defined to display notifications
var activeNotifications = [];
var notificationID = 0;

// Function to show notifications
function addNotification(type="none",text="This is a test notification.",title="",timer=3) {
	switch(type) {
		case "achievement":
			notificationTitle = "Achievement Unlocked!";
			notificationType = "achievement-notification"
			break;
		case "challenge":
			notificationTitle = "Challenge Complete";
			notificationType = "challenge-notification"
			break;
		default:
			notificationTitle = "Something Happened?";
			notificationType = "default-notification"
			break;
	}
	if(title != "") notificationTitle = title;
	notificationMessage = text;
	notificationTimer = timer; 

	activeNotifications.push({"time":notificationTimer,"type":notificationType,"title":notificationTitle,"message":(notificationMessage+"\n"),"id":notificationID})
	notificationID++;
}


//Function to reduce time on active notifications
function adjustNotificationTime(diff) {
	for(notification in activeNotifications) {
		activeNotifications[notification].time -= diff;
		if(activeNotifications[notification]["time"] < 0) {
			activeNotifications.splice(notification,1); // Remove notification when time hits 0
		}
	}
}