# STATUS

## סיכום כללי
- תאריך תכנון ראשוני: 2026-11-12; חידוד חוזה לוח: 2026-11-13.
- מאגר: MeiRR17/hebrew-date-kit; ענף עבודה יחיד: autopilot.
- מצב: תוכנית הוכנה וחוזה מניין ימים הובהר; הושלמו v1, v2 ו-v3 (3 מתוך 6 גרסאות); v4 מוכנה לפיתוח.
- מצב קיים בעת סקירת הענף: README.md עדיין התחלתי; קיימים package.json, src/calendar-core.js, src/dates.js, src/numerals.mjs ובדיקות ו-fixtures לגרסאות v1–v3; מודול החגים, דוגמאות וממשק הספרייה הציבורי עדיין לא מומשו.
- בדיקות: v2 — 8/8 בדיקות node --test test/dates.test.js עברו ב-Node.js 22.16.0 בארבעה TZ (UTC, Asia/Jerusalem, America/Los_Angeles, Pacific/Auckland), מול 122 זוגות תאריכים עצמאיים; v1 — 7/7; v3 — 6/6 במחזורים קודמים. אין עדיין בדיקות אינטגרציה של v4–v6.
- תלות עבודה: v1, v2, v3 הושלמו; v4 מוכנה למימוש; v5 תלויה ב-v4; v6 תלויה ב-v5.
- מקור אמת להשלמה: קוד ו-fixtures שנדחפו לענף autopilot, בתוספת תנאי Done when ב-PLAN.md.

## v1 — תשתית וחישובי לוח
- מצב: הושלם ומומש בענף autopilot.
- נעשה: package.json ב-ES modules וב-Node.js >=22 ללא תלויות; src/calendar-core.js עם חשבון ימים אבסולוטי, המרות פנימיות של תאריכים, דחיות ראש השנה, שנות עיבור ואורכי חודשים, ואימות קלט עם JSDoc.
- אימות: test/calendar-core.test.js עם 7 בדיקות, ו-test/fixtures/calendar-anchors.json עם עוגנים בלתי תלויים ב-Pyluach 2.3.0 וב-Python datetime, לרבות 6 סוגי שנות הלוח.
- בדיקות: node --test test/calendar-core.test.js עבר 7/7 מקומית ב-Node.js 22.16.0 ללא npm install.
- נשאר: אין לגרסה זו; ה-API הציבורי יושלם ב-v5.

## v2 — המרת תאריכים דו-כיוונית
- מצב: הושלם ומומש בענף autopilot.
- נעשה: src/dates.js עם toHebrew ו-toGregorian, תיעוד JSDoc, קלט/פלט {year,month,day} ללא timezone ותמיכה באדר א׳/ב׳; נבנה על מניין הימים האבסולוטי של v1.
- אימות: test/dates.test.js עם 8 בדיקות ו-test/fixtures/date-pairs.json עם 122 זוגות תאריכים עצמאיים מ-pyluach 2.3.0 ומ-Python datetime; כוללים שנת 1, שנים מעוברות, 29 בפברואר, מעברי תשרי ואלול, ומקרי קלט שגוי.
- בדיקות: node --test test/dates.test.js עבר 8/8 ב-Node.js 22.16.0, בארבעה אזורי זמן, ללא npm install.
- נשאר: אין לגרסה זו. ה-API הציבורי יושלם ב-v5.

## v3 — מספרים עבריים וגימטריה
- מצב: הושלם ומומש בענף autopilot.
- נעשה: src/numerals.mjs עם formatHebrewNumber ו-formatHebrewYear, JSDoc, כתיב גרש/גרשיים, ט״ו/ט״ז, אלפים וקיצור שנות 5000; test/numerals.test.mjs עם 6 בדיקות.
- בדיקות: 6/6 עברו ב-Node.js 22 ללא npm install.
- נשאר: אין לגרסה זו. שילוב ה-API הציבורי יתבצע ב-v5.

## v4 — חגים בישראל ובתפוצות
- מצב: לא התחיל; התלות ב-v2 הושלמה ומוכן למימוש.
- נעשה: הוגדר היקף הלוח וכללי האזורים; נוספו תרחישי קבלה להבדלי יום טוב שני, חנוכה בכסלו חסר/מלא, פורים מעובר, מיון ומועדים חופפים.
- נשאר: src/holidays.js, fixtures ובדיקות חגים, צומות והבדלי אזורים.

## v5 — ממשק ציבורי ופרסום
- מצב: לא התחיל; ממתין ל-v2, v3 ו-v4.
- נעשה: נקבע להוציא ספרייה ללא CLI.
- נשאר: src/index.js, package exports, README מלא, LICENSE ודוגמאות עובדות.

## v6 — אימות אינטגרציה וסגירת מוצר
- מצב: לא התחיל; ממתין ל-v5.
- נעשה: נקבעו תנאי הסמכה סופיים.
- נשאר: בדיקות קבלה חוצות שנים, GitHub Actions, בדיקות מלאות ואימות רמת גימור.
