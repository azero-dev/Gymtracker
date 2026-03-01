# PKGBUILD for Gymtrack (Arch Linux)
# Install with: makepkg -si

pkgname=gymtrack-bin
pkgver=0.1.3
pkgrel=1
pkgdesc="Gymtrack: Offline Gym & Workout Tracker"
arch=('x86_64')
url="https://github.com/azero-dev/Gymtracker"
license=('MIT')
depends=('cairo' 'gtk3' 'gdk-pixbuf2' 'hicolor-icon-theme' 'libsoup3' 'webkit2gtk-4.1')
provides=('gymtrack')
conflicts=('gymtrack')

source=("${pkgname}-${pkgver}.deb::${url}/releases/download/v${pkgver}/Gymtrack_${pkgver}_amd64.deb")
sha256sums=('SKIP')

package() {
  # Extract the .deb data using 'ar' (standard for .deb)
  ar p "${pkgname}-${pkgver}.deb" data.tar.gz | tar -xz -C "${pkgdir}/"
  
  # Ensure the binary is executable
  chmod +x "${pkgdir}/usr/bin/app"
  
  # Rename 'app' to 'gymtrack' for easier terminal use
  mv "${pkgdir}/usr/bin/app" "${pkgdir}/usr/bin/gymtrack"
  
  # Fix the .desktop file to point to the new name
  sed -i 's/Exec=app/Exec=gymtrack/g' "${pkgdir}/usr/share/applications/Gymtrack.desktop"
}
