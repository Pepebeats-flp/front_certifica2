rm -rf /media/seba/Dev/back/slared/metropol-certifica/dist_ant/ || true
rm -rf /media/seba/Dev/back/slared/redbus-certifica/dist_ant/ || true
rm -rf /media/seba/Dev/back/slared/subus-certifica/dist_ant/ || true
rm -rf /media/seba/Dev/back/slared/voy-certifica/dist_ant/ || true

mv /media/seba/Dev/back/slared/metropol-certifica/dist /media/seba/Dev/back/slared/metropol-certifica/dist_ant
mv /media/seba/Dev/back/slared/redbus-certifica/dist /media/seba/Dev/back/slared/redbus-certifica/dist_ant
mv /media/seba/Dev/back/slared/subus-certifica/dist /media/seba/Dev/back/slared/subus-certifica/dist_ant
mv /media/seba/Dev/back/slared/voy-certifica/dist /media/seba/Dev/back/slared/voy-certifica/dist_ant

mkdir /media/seba/Dev/back/slared/metropol-certifica/dist
mkdir /media/seba/Dev/back/slared/redbus-certifica/dist
mkdir /media/seba/Dev/back/slared/subus-certifica/dist
mkdir /media/seba/Dev/back/slared/voy-certifica/dist

cp -a dist_metropol/. /media/seba/Dev/back/slared/metropol-certifica/dist/
cp -a dist_redbus/. /media/seba/Dev/back/slared/redbus-certifica/dist/
cp -a dist_subus/. /media/seba/Dev/back/slared/subus-certifica/dist/
cp -a dist_voy/. /media/seba/Dev/back/slared/voy-certifica/dist/

cd  /media/seba/Dev/back/slared/metropol-certifica/ && firebase deploy
cd  /media/seba/Dev/back/slared/redbus-certifica/ && firebase deploy
cd  /media/seba/Dev/back/slared/subus-certifica/ && firebase deploy
cd  /media/seba/Dev/back/slared/voy-certifica/ && firebase deploy
