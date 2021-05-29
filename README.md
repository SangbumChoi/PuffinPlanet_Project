# PuffinPlanet_Project

## 빌드 방법

처음에 `git clone`을 이용해서 저장소를 복제해온 뒤에 /puffdisplay에서 `npm install`을 통해서 dependency모듈을 설치할 수 있습니다. 또한 /puffdisplay 에서 `npm start` 를 통하여 빌드할 수 있습니다.

### Window of Mac user
1. install nodejs in [Node.js installer](https://nodejs.org/en/download/)
2. Verify installation by  `npm -v or node -v`. If you are using git bash or some kind of git application for your acticavation, then you might need to follow additional flow.

    (Additional) in windowOS the path that correspond to nodejs
    
    `C:\Program Files\nodejs>set path=%PATH%;%CD%`
    
    `C:\Program Files\nodejs>setx path "%PATH%"`

3. `git clone https://github.com/SangbumChoi/PuffinPlanet_Project.git`
4. `cd puffdisplay`
5. `npm start`