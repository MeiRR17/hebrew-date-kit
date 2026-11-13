# PLAN
מטרה: לספק ספריית JavaScript קטנה, מדויקת וללא תלות חיצונית להמרות תאריכים עבריים, לחגים לפי ישראל/תפוצות ולגימטריה, עם בדיקות ותיעוד מלאים.

## v1 — תשתית וחישובי לוח
repo: MeiRR17/hebrew-date-kit
after: none
- [x] צור package.json במצב ES modules עם engines של Node.js 22 ומעלה, פקודת test שמריצה node --test וללא dependencies או devDependencies.
- [x] ממש ב-src/calendar-core.js חישובי ימים אבסולוטיים, שנה עברית מעוברת, דחיות ראש השנה, אורכי חשוון/כסלו ואורכי חודשים; הימנע מתלות באזור זמן.
- [x] הוסף test/calendar-core.test.js ו-test/fixtures/calendar-anchors.json עם מקרי קצה ידועים: ראש השנה, שנים פשוטות ומעוברות ושנות לוח משתנות.
- [x] הוסף בדיקת קלט למספרי שנים/חודשים/ימים לא תקינים ותיעוד JSDoc לכל export מהמודול.
- [x] קבע וחשוף בחישובי הליבה מניין ימים אבסולוטי אחיד (יום 1 = 1 בינואר שנת 1 בלוח הגרגוריאני הפרולפטי), עם ימים שלמים בלבד וגבולות שנה מפורשים; בדוק מקרי סף של דחיות ראש השנה וחשוון/כסלו.
Done when: קיימים package.json, src/calendar-core.js, test/calendar-core.test.js ו-fixture; הפקודה node --test test/calendar-core.test.js עוברת ללא npm install או תלות חיצונית.

## v2 — המרת תאריכים דו-כיוונית
repo: MeiRR17/hebrew-date-kit
after: v1
- [x] ממש ב-src/dates.js פונקציות מתועדות toHebrew({year,month,day}) ו-toGregorian({year,month,day}) על בסיס calendar-core, עם אימות תאריכים וטיפול בשנים מעוברות.
- [x] הגדר החזרה עקבית של {year,month,day} במספור חודשים עבריים מניסן=1 עד אדר ב׳=13 בשנה מעוברת, וייצוג שמות חודשים לפי הצורך; אל תסתמך על timezone מקומי.
- [x] צור test/fixtures/date-pairs.json הכולל זוגות תאריכים מאומתים מתקופות ושנים רבות, לרבות אדר א׳/ב׳, תחילת תשרי, סוף אלול ושנים גרגוריאניות מעוברות.
- [x] הוסף test/dates.test.js לבדיקת שני הכיוונים, round-trip, ולשגיאות על תאריכים שאינם קיימים.
- [x] הגדר קלט/פלט כתאריך אזרחי ללא שעה או timezone, וודא עקביות עם מניין הימים האבסולוטי של v1; בדוק 29 בפברואר, 1 בינואר ומעברי שנה עברית.
Done when: node --test test/dates.test.js עובר לכל זוגות התאריכים בקובץ ה-fixtures, וכל תאריך תקין שנבדק חוזר לעצמו בהמרה הלוך ושוב.

## v3 — מספרים עבריים וגימטריה
repo: MeiRR17/hebrew-date-kit
after: none
- [x] ממש ב-src/numerals.mjs פונקציות מתועדות formatHebrewNumber(number) ו-formatHebrewYear(year), ללא חבילות חיצוניות.
- [x] תמוך בסימני גרש/גרשיים תקניים, בצורות ט״ו/ט״ז, במאות, באלפים ובקיצור אלפי השנים בתאריך עברי, כך ש-formatHebrewYear(5787) מחזיר תשפ״ז.
- [x] הוסף test/numerals.test.mjs למספרים קטנים וגדולים, לשנים עבריות, לקלט לא תקין ולכתיב הכולל סימני פיסוק; השתמש בסיומת .mjs כדי שהבדיקות ירוצו לפני ש-v1 יוצרת package.json.
Done when: node --test test/numerals.test.mjs עובר גם לפני יצירת package.json, ללא npm install; formatHebrewYear(5787) מחזיר בדיוק תשפ״ז.

## v4 — חגים בישראל ובתפוצות
repo: MeiRR17/hebrew-date-kit
after: v2
- [x] ממש ב-src/holidays.js פונקציה מתועדת getJewishHolidays(hebrewYear, {region}) המחזירה רשימה ממוינת של מזהה חג, שם, סוג ותאריך עברי/גרגוריאני; region הוא israel או diaspora בלבד.
- [x] כלול מועדי התורה, ראש השנה ויום כיפור, סוכות/שמיני עצרת/שמחת תורה, פסח, שבועות, חנוכה, פורים, תעניות וימי ציון מסורתיים נפוצים; בצע דחיית צומות לפי כללי הלוח.
- [x] הבדל במפורש בין ימי חג בישראל ובתפוצות, כולל יום טוב שני של גלויות, אורך פסח/שבועות ומועד שמחת תורה, וכן פורים באדר ב׳ בשנה מעוברת.
- [x] הוסף test/holidays.test.js ו-test/fixtures/holiday-cases.json עם תאריכים צפויים ואימות הבדלי אזורים, שנים מעוברות ודחיות.
- [x] הוסף ל-fixtures הבדלי אזורים מפורשים: ט״ז בניסן (יום טוב שני בתפוצות לעומת חול המועד בישראל), כ״ב בניסן (יום טוב אחרון בתפוצות בלבד), כ״ב בתשרי (שמיני עצרת בשני האזורים ושמחת תורה בישראל), כ״ג בתשרי (שמחת תורה בתפוצות בלבד), וכן שבועות וצום שנדחה.
- [x] הוסף תרחישי קצה לחנוכה בן שמונה ימים גם בשנות כסלו חסר/מלא, לפורים באדר ב׳ בשנה מעוברת, וליום שבו חלים כמה מועדים; ודא מיון כרונולוגי לפי היום האבסולוטי, שימור מועדים חופפים ומניעת רשומות כפולות של אותו מזהה באותו יום.
Done when: node --test test/holidays.test.js עובר, ולפחות פסח, שבועות ושמחת תורה מציגים הבדלים נכונים בין israel ל-diaspora בשנות הבדיקה.

## v5 — ממשק ציבורי ופרסום
repo: MeiRR17/hebrew-date-kit
after: v2, v3, v4
- [x] צור src/index.js עם ייצוא API ציבורי מצומצם ו-JSDoc לכל export (לרבות src/numerals.mjs), וחבר את package.json לשימוש ב-import כ-ES module ללא CLI.
- [x] כתוב README.md מלא באנגלית: שם, משפט תיאור, מוטיבציה, תכונות, quick start, שימוש, הרצת בדיקות, מבנה הפרויקט, וסעיף Author אחרון בנוסח המדויק שב-BRIEF.
- [x] צור LICENSE בתנאי MIT עם copyright 2026 Meir Dvir.
- [x] צור examples/date-conversion.mjs, examples/holidays.mjs ו-examples/numerals.mjs, שכל אחד רץ עם node בלבד ומדגים את ממשק הספרייה.
- [x] ודא ש-package.json אינו כולל bin, npm dependencies או devDependencies ושהתיעוד מתאר רק יכולות ממומשות.
Done when: כל שלוש הדוגמאות רצות ב-node 22+, import של src/index.js מצליח, README מכיל את הסעיפים שנדרשו ו-LICENSE הוא MIT עם ייחוס 2026.

## v6 — אימות אינטגרציה וסגירת מוצר
repo: MeiRR17/hebrew-date-kit
after: v5
- [x] הוסף test/fixtures/acceptance-pairs.json ו-test/acceptance.test.js עם טבלת אימות בלתי תלויה המשתרעת על עשרות שנים, כולל שנים עבריות וגרגוריאניות מעוברות.
- [x] הוסף .github/workflows/ci.yml המריץ את בדיקות node --test ב-Node.js 22 בענף autopilot בלי התקנת חבילות.
- [x] בדוק שהמרות, חגים וגימטריה עובדים יחד, שמקרי קצה נשמרים, ושאותן בדיקות אינן תלויות באזור הזמן של המחשב.
- [ ] סקור את המוצר הסופי: JSDoc לכל export, תיעוד תואם לקוד, אפס תלויות, אפס סודות, ללא placeholders וללא נכסים או צילומי מסך מומצאים; תקן רק ממצאים ממשיים.
Done when: node --test עובר מקומית, בדיקת GitHub Actions ב-autopilot ירוקה, כל הדוגמאות רצות והמאגר עומד ברשימת דרישות BRIEF.md.
