# STATUS

## סיכום כללי
- תאריך תכנון ראשוני: 2026-11-12; חידוד חוזה לוח: 2026-11-13.
- מאגר: MeiRR17/hebrew-date-kit; ענף עבודה יחיד: autopilot.
- מצב: תוכנית הוכנה וחוזה מניין ימים הובהר; הושלמו v1–v6 (6 מתוך 6 גרסאות). כל בדיקות CI למימוש v6 עברו; נדרש אימות CI נוסף לגרסת האריזה הסופית לפני מיזוג ל-main.
- מצב קיים בעת סקירת הענף: קיימים כל מודולי הליבה, src/index.js המייצא חמש פונקציות, package.json v0.5.0 עם exports, README מלא באנגלית, LICENSE MIT, שלוש דוגמאות ב-examples/ ובדיקות ממשק ציבורי. נוספו בדיקות קבלה, CI, ותיעוד סקירה סופית; הוגדרה גרסת ספרייה 1.0.0.
- בדיקות: v5 — 4/4 בדיקות ממשק ציבורי עברו בארבעה אזורי זמן; חבילת הבדיקות המקומית: 35/35 ב-Node.js 22.16.0. שלוש דוגמאות פעלו עם node בלבד; npm pack --dry-run אימת שמונה קבצים בחבילה ללא dependencies. בדיקות CI עבור commit f5f6158 עברו: 4/4 jobs, 42/42 tests בכל אזור זמן, ושלוש דוגמאות. הרצת CI נוספת לגרסת הסגירה נדרשת.
- תלות עבודה: v1–v5 הושלמו; כל שש הגרסאות מומשו; נותר לאמת CI על ה-commit הסופי לפני מיזוג.
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
- מצב: הושלם ומומש בענף autopilot.
- נעשה: src/index.js חושף חמש פונקציות עם JSDoc; package.json עודכן ל-v0.5.0, Node >=22, exports של ES module, license MIT, ללא bin וללא npm dependencies או devDependencies; README.md מלא באנגלית, עם הסבר מגבלות ושימוש וסעיף Author מדויק מה-BRIEF; LICENSE כולל MIT עם copyright 2026 Meir Dvir.
- דוגמאות: examples/date-conversion.mjs, examples/holidays.mjs, examples/numerals.mjs רצו בהצלחה ב-node בלבד ללא התקנה.
- בדיקות: test/public-api.test.js עבר 4/4 בארבעה אזורי זמן; node --test מקומי עבר 35/35; npm pack --dry-run אימת שמונה קובצי חבילה.
- נותר: אין לגרסה זו. לא בוצע npm publish ולא בוצע מיזוג ל-main; CI ובדיקות קבלה סופיות ב-v6.

## v6 — אימות אינטגרציה וסגירת מוצר
- מצב: מימוש הגרסה הושלם. Release candidate עם package.json גרסה 1.0.0, GitHub Actions וסקירה מתועדת.
- נעשה: test/fixtures/acceptance-pairs.json עם 72 זוגות תאריכים בלתי תלויים מ-pyluach 2.3.0 ו-Python datetime על פני שנים 1–9999; test/acceptance.test.js עם שבע בדיקות קבלה הבודקות המרות, שנות עיבור, חגים והבדלי אזורים, צומות, גימטריה ותקינות חבילה.
- CI: commit f5f6158 אומת בירוק ב-GitHub Actions run 43448683753, עם 42/42 בדיקות בכל אחד מארבעה אזורי זמן, ושלוש דוגמאות. workflow שודרג לפעולות v7, עם הרשאות read בלבד וללא npm install.
- סקירה: docs/autopilot/REVIEWS.md מתעד את דרישות המוצר, הבדיקות ומגבלות הסקירה.
- תנאי למיזוג: אימות מחדש של CI על commit הסגירה. אין לטעון ל-npm publish.

