echo 'installing client dependencies'
cd client
npm install

echo 'installing server dependencies'
cd ../server
npm install

echo 'installing more server dependencies'
cd dtw
npm install


echo 'dependencies run ./server/dtw/serve.sh to fire up the server'