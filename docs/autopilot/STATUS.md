# STATUS

## סיכום כללי
- תאריך תכנון ראשוני: 2026-11-12; חידוד חוזה לוח: 2026-11-13.
- מאגר: MeiRR17/hebrew-date-kit; ענף עבודה יחיד: autopilot.
- מצב: תוכנית הוכנה וחוזה מניין ימים הובהר; הושלמו v1, v2, v3 ו-v4 (4 מתוך 6 גרסאות); v5 מוכנה לפיתוח.
- מצב קיים בעת סקירת הענף: README.md עדיין התחלתי; קיימים package.json, src/calendar-core.js, src/dates.js, src/numerals.mjs, src/holidays.js ובדיקות ו-fixtures לגרסאות v1–v4. דוגמאות וממשק הספרייה הציבורי עדיין לא מומשו.
- בדיקות: v4 — 10/10 בדיקות node --test test/holidays.test.js עברו ב-Node.js 22.16.0. חבילת בדיקות מקומית מלאה: 31/31 בכל אחד מארבעה TZ (UTC, Asia/Jerusalem, America/Los_Angeles, Pacific/Auckland). בדיקות CI ואינטגרציה נוספות עדיין מתוכננות ב-v6.
- תלות עבודה: v1, v2, v3, v4 הושלמו; v5 מוכנה למימוש; v6 תלויה ב-v5.
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
- מצב: הושלם ומומש בענף autopilot.
- נעשה: src/holidays.js עם getJewishHolidays(year, {region}), חגים ומועדים בסדר כרונולוגי עם מזהה, שם, סוג ותאריך עברי/גרגוריאני. יש יום טוב שני בתפוצות, שמיני עצרת/שמחת תורה, פסח, שבועות, סוכות, ראש השנה, יום כיפור, חנוכה, פורים ואדר א׳/ב׳, דחיות תעניות ומועדים מסורתיים נוספים.
- גיבוי: test/fixtures/holiday-cases.json עם 72 עוגני חג עצמאיים ו-15 מקרי היעדר; תאריכים הוצלבו עם pyluach 2.3.0 ו-Python datetime.
- בדיקות: 10/10 ל-v4 ו-31/31 לכל חבילת הבדיקות בארבעה אזורי זמן ב-Node.js 22.16.0, ללא npm install.
- נשאר: אין לגרסה זו. חשיפת ה-API הציבורי ותיעוד השימוש יתבצעו ב-v5.

## v5 — ממשק ציבורי ופרסום
- מצב: לא התחיל; כל התלויות הושלמו ומוכן למימוש.
- נעשה: נקבע להוציא ספרייה ללא CLI.
- נשאר: src/index.js, package exports, README מלא, LICENSE ודוגמאות עובדות.

## v6 — אימות אינטגרציה וסגירת מוצר
- מצב: לא התחיל; ממתין ל-v5.
- נעשה: נקבעו תנאי הסמכה סופיים.
- נשאר: בדיקות קבלה חוצות שנים, GitHub Actions, בדיקות מלאות ואימות רמת גימור.
