<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

<!-- [![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url] -->



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/GetOurRI/DungDong">
    <img src="src/assets/logo.png" alt="Logo" width="80" height="80">
  </a>

<h1 align="center">둥지동지</h1>

  <p align="center">
    🖼️ 한 장의 이미지로 룸메이트 구하기!
    <br />
    <a href="https://getourri.github.io/DungDong"><strong>둥지동지 바로가기</strong></a>
    <a href="https://github.com/GetOurRI"><strong>프로젝트 설명 바로가기</strong></a>
    <br />
    <br />
  </p>
</div>

<!-- 프로젝트 소개 -->
## 프로젝트 소개

![둥지동지 스크린샷](src/assets/main_product_img.png)

둥지동지는 중앙대학교 다빈치 캠퍼스의 학우들이 기숙사 룸메이트를 빠르고 편하게 구할 수 있도록 기획한 프로젝트입니다.<br>
자신의 기숙사 생활에 대한 설문을 기반으로 룸메이트 구인 글에 사용할 이미지를 자동으로 생성해줍니다.
모바일 웹에 최적화된 UI를 통해 누구나 간편하게 이용할 수 있습니다.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### 📚 기술 스택

[![Vue][Vue.js]][Vue-url] [![Vuetify][Vuetify]][Vuetify-url] 
[![Firebase][Firebase]][Firebase-url]
[![Github Pages][Github Pages]][Github-Pages-url] 
[![Figma][Figma]][Figma-url] 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- 시작하기 -->
## 시작하기
### 사전 요구사항

이 프로젝트는 `Vuetify`와 `Vue.js`를 기반으로 하고 있습니다. 


### 설치

1. Firebase에서 API 키 발급 [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
2. 레포 클론하기
   ```sh
   git clone https://github.com/Ebee1205/DungDong.git
   ```
3. NPM 패키지 설치
   ```sh
   npm install
   ```
4. `.env` 파일 생성 후 Firebase API 키 입력
   ```.env
   // .env file
   
    VITE_FIREBASE_API_KEY = 
    VITE_FIREBASE_AUTH_DOMAIN = 
    VITE_FIREBASE_PROJECT_ID = 
    VITE_FIREBASE_STORAGE_BUCKET = 
    VITE_FIREBASE_MESSAGING_SENDER_ID = 
    VITE_FIREBASE_APP_ID = 
    VITE_FIREBASE_MEASUREMENT_ID = 
   ```
<!-- 5. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin github_username/repo_name
   git remote -v # confirm the changes
   ``` -->

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/github_username/repo_name/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/github_username/repo_name/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/github_username/repo_name/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/github_username/repo_name/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/github_username/repo_name/blob/master/LICENSE.txt

[product-screenshot]: images/screenshot.png

[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Vuetify]: https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF
[Vuetify-url]: https://vuetifyjs.com/
[Figma]: https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white
[Figma-url]: https://www.figma.com/
[Firebase]: https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34
[Firebase-url]: https://firebase.google.com/
[Github Pages]:https://img.shields.io/badge/github%20pages-121013?style=for-the-badge&logo=github&logoColor=white
[Github-Pages-url]: https://pages.github.com/