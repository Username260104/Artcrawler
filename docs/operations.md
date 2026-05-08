# 운영 메모

## 예약 크롤링

Vercel 배포 기준으로 하루 1회 `/api/cron/crawl`이 호출된다.

```json
{
  "path": "/api/cron/crawl",
  "schedule": "0 18 * * *"
}
```

Vercel cron은 UTC 기준이다. `0 18 * * *`는 한국 시간 기준 매일 새벽 3시다.

## 필요한 환경 변수

```text
DATABASE_URL
CRON_SECRET
```

`CRON_SECRET`이 설정되어 있으면 `/api/cron/crawl`은 다음 header를 요구한다.

```text
Authorization: Bearer <CRON_SECRET>
```

로컬 dry-run은 DB 없이 실행할 수 있다.

```bash
npm run crawl:dry
```

실제 DB upsert는 `DATABASE_URL`이 필요하다.

```bash
npm run crawl
```

## 현재 활성 adapter

- Pace Seoul
- White Cube Seoul
- Perrotin Seoul
- 국제갤러리
- PKM 갤러리

Perrotin처럼 현재 서울 전시가 없으면 `partial`로 기록될 수 있다. 이는 실패가 아니라 파싱 결과 0건을 뜻한다.

## 검증 명령

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run crawl:dry
```

