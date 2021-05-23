#!/bin/sh
cd ~
echo "🕹️ Auto install Script 🕹️"
echo " by Matheus Dias 👽️"

sudo apt update -y ;
sudo apt install git -y; 
sudo apt install menulibre -y;
sudo apt install synaptic -y ;
sudo apt install arc-theme - y;
sudo apt purge pulseaudio -y  ;
sudo apt install gimp -y ;
sudo apt install inkscape -y ;
sudo apt install pikopixel.app -y ;
sudo apt install libreoffice -y ;
sudo apt install minecraft-pi -y ;

#papirus

set -e

gh_repo="papirus-icon-theme"
gh_desc="Papirus icon theme"

cat <<- EOF
      ppppp                         ii
      pp   pp     aaaaa   ppppp          rr  rrr   uu   uu     sssss
      ppppp     aa   aa   pp   pp   ii   rrrr      uu   uu   ssss
      pp        aa   aa   pp   pp   ii   rr        uu   uu      ssss
      pp          aaaaa   ppppp     ii   rr          uuuuu   sssss
                          pp
                          pp
  $gh_desc
  https://github.com/PapirusDevelopmentTeam/$gh_repo
EOF

: "${DESTDIR:=/usr/share/icons}"
: "${ICON_THEMES:=Papirus ePapirus Papirus-Dark Papirus-Light}"
: "${TAG:=master}"
: "${uninstall:=false}"

_msg() {
    echo "=>" "$@"
}

_rm() {
    # removes parent directories if empty
    _sudo rm -rf "$1"
    _sudo rmdir -p "$(dirname "$1")" 2>/dev/null || true
}

_sudo() {
    if [ -w "$DESTDIR" ] || [ -w "$(dirname "$DESTDIR")" ]; then
        "$@"
    else
        sudo "$@"
    fi
}

_download() {
    _msg "Getting the latest version from GitHub ..."
    wget -O "$temp_file" \
        "https://github.com/PapirusDevelopmentTeam/$gh_repo/archive/$TAG.tar.gz"
    _msg "Unpacking archive ..."
    tar -xzf "$temp_file" -C "$temp_dir"
}

_uninstall() {
    eval set -- "$@"  # split args by space

    for theme in "$@"; do
        test -d "$DESTDIR/$theme" || continue
        _msg "Deleting '$theme' ..."
        _rm "$DESTDIR/$theme"
    done
}

_install() {
    _sudo mkdir -p "$DESTDIR"

    eval set -- "$@"  # split args by space

    for theme in "$@"; do
        test -d "$temp_dir/$gh_repo-$TAG/$theme" || continue
        _msg "Installing '$theme' ..."
        _sudo cp -R "$temp_dir/$gh_repo-$TAG/$theme" "$DESTDIR"
        _sudo cp -f \
            "$temp_dir/$gh_repo-$TAG/AUTHORS" \
            "$temp_dir/$gh_repo-$TAG/LICENSE" \
            "$DESTDIR/$theme" || true
        _sudo gtk-update-icon-cache -q "$DESTDIR/$theme" || true
    done

    # Try to restore the color of folders from a config
    if command -v papirus-folders >/dev/null; then
        papirus-folders -R || true
    fi
}

_cleanup() {
    _msg "Clearing cache ..."
    rm -rf "$temp_file" "$temp_dir"
    rm -f "$HOME/.cache/icon-cache.kcache"
    _msg "Done!"
}

trap _cleanup EXIT HUP INT TERM

temp_file="$(mktemp -u)"
temp_dir="$(mktemp -d)"

if [ "$uninstall" = "false" ]; then
    _download
    _uninstall "$ICON_THEMES"
    _install "$ICON_THEMES"
else
    _uninstall "$ICON_THEMES"
fi
#papirus-end

#auto-configure
git clone https://github.com/Botspot/pi-apps ;
~/pi-apps/install ;   

git clone https://github.com/MatheusNDDS/rpi-auto-configure.git ;

rm -rf ~/.config/openbox ; rm -rf ~/.config/lxpanel ; rm -rf ~/.config/lxsession ; rm -rf ~/.config/pcmanfm ; rm -rf ~/.config/menus ; lxpanelctl restart ; rm -rf ~/.config/Mousepad ; rm -rf ~/.config/Thonny ; rm -rf ~/.config/bash-magic ; rm -rf ~/.config/geany ; rm -rf ~/.config/lxterminal ; rm -rf ~/.local/share/applications ; rm -rf ~/.local/gvfs-metadata ;

cp -R ~/rpi-auto-configure/share/* ~/.local/share/ ;
cp -R ~/rpi-auto-configure/* ~/.config/ ;


sudo cp -R ~/rpi-auto-configure/bash-magic/* /bin/ ;
sudo chmod 777 /bin/up ;
sudo chmod 777 /bin/pisession ;
sudo chmod 777 /bin/c ;
sudo chmod 777 /bin/off ;

rm -rf ~/rpi-auto-configure ;
reboot
sudo apt autoremove
reboot