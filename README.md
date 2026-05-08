# Art crawler

주요 한국 미술관·갤러리의 전시 정보를 수집해 달력으로 확인하는 Next.js 앱입니다.

## Local

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

개발 중 DB를 아직 만들지 않은 경우에는 `npm run crawl:snapshot`으로 로컬 스냅샷을 갱신해 화면을 볼 수 있습니다. 배포 환경은 PostgreSQL `DATABASE_URL`이 필수입니다.

## Database

프로덕션 데이터 흐름은 다음과 같습니다.

1. PostgreSQL DB 생성
2. `DATABASE_URL` 환경변수 설정
3. `npm run db:migrate`로 Prisma migration 적용
4. `npm run db:seed` 또는 `/api/cron/crawl`로 공식 사이트/API 수집 실행
5. 앱 화면은 DB에 저장된 전시를 우선 표시

필수 환경변수:

```bash
DATABASE_URL="postgresql://user:password@host:5432/artcrawler?schema=public"
CRON_SECRET="replace-with-a-long-random-secret"
```

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run start`: 프로덕션 서버 실행
- `npm run crawl`: 공식 사이트/API에서 전시 정보를 수집해 DB에 저장
- `npm run crawl:dry`: DB 저장 없이 수집 결과만 확인
- `npm run crawl:snapshot`: 로컬 개발용 스냅샷 갱신
- `npm run db:generate`: Prisma Client 생성
- `npm run db:migrate`: 배포 DB에 Prisma migration 적용
- `npm run db:seed`: 초기 DB 수집 실행
- `npm run lint`: ESLint 검사
- `npm run typecheck`: TypeScript 검사
- `npm test`: Vitest 테스트

## Deploy

Vercel에서 GitHub 저장소를 Import한 뒤 환경변수를 먼저 설정합니다.

- Framework: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`
- Environment Variables: `DATABASE_URL`, `CRON_SECRET`

첫 배포 후에는 Vercel CLI나 로컬 터미널에서 동일한 `DATABASE_URL`을 잡고 `npm run db:migrate`, `npm run db:seed`를 실행합니다. 이후 예약 수집은 `vercel.json`의 `/api/cron/crawl` cron route가 DB를 갱신합니다.
