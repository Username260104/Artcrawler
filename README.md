# Art crawler

주요 한국 미술관·갤러리의 전시 정보를 수집해 달력으로 확인하는 Next.js 앱입니다.

## Local

```bash
npm install
npm run crawl:snapshot
npm run dev
```

기본 화면은 `data/exhibitions.snapshot.json`을 읽습니다. DB가 없으면 로컬 스냅샷을 사용하고, 스냅샷도 없으면 fixture 데이터를 사용합니다.

## Scripts

- `npm run dev`: 개발 서버 실행
- `npm run crawl:snapshot`: 공식 사이트/API에서 전시 정보를 수집해 로컬 스냅샷 갱신
- `npm run build`: 프로덕션 빌드
- `npm run lint`: ESLint 검사
- `npm run typecheck`: TypeScript 검사
- `npm test`: Vitest 테스트

## Environment

선택적으로 PostgreSQL을 사용할 수 있습니다.

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/artcrawler?schema=public"
CRON_SECRET="replace-with-a-long-random-secret"
```

DB가 설정된 배포 환경에서는 `/api/cron/crawl`로 DB 저장형 수집을 실행할 수 있습니다. DB 없이 배포하면 포함된 스냅샷 데이터를 화면에 표시합니다.
