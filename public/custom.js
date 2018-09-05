function spinIcon() {
    let settingButton = document.getElementById("settings");
    let arrow = document.getElementById("arrow");
    if (settingButton.style.display === "none") {
            arrow.style.transform = "rotate(-135deg)"
            arrow.style.webkitTransform = "rotate(-135deg)"
            settingButton.style.display = "block";
    } else {
        settingButton.style.display = "none";
        arrow.style.transform = "rotate(45deg)"
        arrow.style.webkitTransform = "rotate(45deg)"
    }
}