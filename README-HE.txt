התקנת כפתור פרסום ישיר ל־Vercel

חשוב: הפרסום הישיר עובד כאשר פרויקט Vercel מחובר למאגר GitHub, ו־index.html נמצא בשורש המאגר. כפתור הניהול יעדכן את הקובץ במאגר, ו־Vercel יבנה פריסה חדשה אוטומטית.

1. העלו/הכניסו את index.html ואת תיקיית api/publish.js לשורש המאגר שמחובר לפרויקט Vercel.
   מבנה:
     index.html
     api/publish.js

2. ב־GitHub צרו Personal Access Token עם הרשאת Contents: Read and write למאגר הזה בלבד.
   אל תכניסו את הטוקן לתוך HTML או JavaScript של הדפדפן.

3. ב־Vercel: Project → Settings → Environment Variables. הוסיפו:
   GITHUB_TOKEN       = הטוקן שיצרתם
   GITHUB_OWNER       = שם המשתמש/הארגון ב־GitHub
   GITHUB_REPO        = שם המאגר
   GITHUB_BRANCH      = main (או שם הענף שמחובר ל־Vercel)
   GITHUB_FILE_PATH   = index.html
   PUBLISH_PASSWORD   = מפתח פרסום חזק לבחירתכם; תידרשו להזין אותו בכל פרסום

4. שמרו את משתני הסביבה ובצעו Redeploy פעם אחת מתוך Vercel.

5. היכנסו לאתר → 10 לחיצות מהירות על הלוגו → סיסמת מנהל 5215 → שנו הגדרה → „שמור ופרסם ב־Vercel” → הזינו את PUBLISH_PASSWORD.

הערות:
- PUBLISH_PASSWORD נפרד מסיסמת הכניסה למנהל. הוא לא נשמר בקוד האתר.
- לאחר עדכון הקובץ ב־GitHub, הפריסה ב־Vercel לוקחת זמן קצר. אם יש כשל, הודעת השגיאה תוצג בעמוד המנהל.
- קובץ HTML גדול מ־4MB לא יישלח דרך הפונקציה. אם משלבים תמונות רבות בתוך HTML, צריך להקטין אותן או לשמור אותן בנפרד.
- אם הפרויקט לא מחובר ל־GitHub, יש לחבר אותו למאגר לפני שהכפתור יכול לפרסם בדרך הזו.
