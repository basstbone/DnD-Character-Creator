# Fullstack-Slider
> Repo showing CRUD with MongoDB connections

### authorship and version

`@basstbone` | `2026-10-12` | `HOTEL`

### deployments, codebase, and repo features

| requirement | evidence |
| --- | --- |
| main | [main](https://github.com/basstbone/fullstack-slider) |
| PROD | [PROD](https://soliver.barrycumbie.com/) |
| dev | [dev](https://github.com/basstbone/fullstack-slider/tree/dev) |
| DEV | [DEV](https://fullstack-slider.onrender.com) |
| docs | [docs](https://github.com/basstbone/fullstack-slider/tree/main/docs) |
| MongoDB connection | [server code](https://github.com/basstbone/fullstack-slider/blob/a77b674ba4eed2213eeb01c682a68ce97d2f2358/server/mongo.js#L19) |
| GET all |  [endpoint code](https://github.com/basstbone/fullstack-slider/blob/a77b674ba4eed2213eeb01c682a68ce97d2f2358/server/mongo.js#L73) |
| GET one | [endpoint code](https://github.com/basstbone/fullstack-slider/blob/a77b674ba4eed2213eeb01c682a68ce97d2f2358/server/mongo.js#L101) |
| filtered GET | [endpoint code](https://github.com/basstbone/fullstack-slider/blob/a77b674ba4eed2213eeb01c682a68ce97d2f2358/server/mongo.js#L81) |
| POST / create | [endpoint code](https://github.com/basstbone/fullstack-slider/blob/66f9f89728c58b0ca03e7bfc453b8575e2dfc741/server/mongo.js#L120) |
| PATCH / update | [endpoint code](https://github.com/basstbone/fullstack-slider/blob/66f9f89728c58b0ca03e7bfc453b8575e2dfc741/server/mongo.js#L157) |
| DELETE | [endpoint code](https://github.com/basstbone/fullstack-slider/blob/81fa8df9f2f920e9d592af4e7efce2eb7c3ee14f/server/mongo.js#L168) |
| frontend `fetch()` | [client code](https://github.com/basstbone/fullstack-slider/blob/81fa8df9f2f920e9d592af4e7efce2eb7c3ee14f/public/hotel.html#L168) |
| persistent CRUD | [PROD app](https://soliver.barrycumbie.com/) |
| HOTEL milestone | [milestone](https://github.com/basstbone/fullstack-slider/milestone/1) |
| example issue | [issue #](https://github.com/basstbone/fullstack-slider/issues/3) |
| dev branch | [branch](https://github.com/basstbone/fullstack-slider/tree/dev) |
| feature → dev | [PR #](https://github.com/basstbone/fullstack-slider/pull/5) |
| dev → main | [PR #](https://github.com/basstbone/fullstack-slider/pull/6) |
| PROD deployment | [GitHub Action](https://github.com/basstbone/fullstack-slider/actions/runs/38272772944) |

### user story
- **As a** beginner developer
- **I want** a place to develop
- **so that** I can improve my skills

### architecture

``` text
LOCAL
  │
  ▼
GitHub
  │
  ├── dev  ──► Render ─────────► DEV
  │
  └── main ──► GitHub Actions ─► GCP ──► PROD
```

### stack

HTML/CSS/JS | Bootstrap 5 | Node.js | Express | REST |
MongoDB | Atlas | Git/GitHub | GCP | Nginx | PM2 | GitHub Actions

### project structure

``` text
repo/
├── .github/
│   └── workflows/
├── docs/
│   └── README.md
├── public/
│   ├── index.html
│   ├── css/
│   └── js/
├── server/
│   ├── app.js
│   ├── mongo.js
│   ├── package.json
│   └── package-lock.json
└── .gitignore
```

### GCP

external IP: `34.152.7.76`\
Linux user: `seanolivertbone`\
instructor SSH public key installed: `yes`
