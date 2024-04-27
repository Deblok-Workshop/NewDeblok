# Install and Deploy DeblokManager
if command -v "git" &> /dev/null; then
  sleep 0
else
  echo "ERR: Git is not installed"
  exit 1
fi

if command -v "bun" &> /dev/null; then
  sleep 0
else
  echo "ERR: Bun is not availiable in this shell or it is not installed."
  exit 1
fi

#if [[ $EUID -ne 0 ]]; then
#  echo "ERR: This script must be run as root."
#  exit 1
#fi

if [ ! -d "/etc/systemd" ]; then
  echo "ERR: This system seems to not be managed by systemd"
  exit 1
fi

git clone https://github.com/Deblok-Workshop/DeblokManager
cd DeblokManager
sudo bash setup_dockertcp.sh
bun i
bun run index.ts &
sleep 1
cd ..
bun run build
bun run start &
sleep 1
echo INFO: Deployed successfully. Both servers should be running!
                                                                                                   