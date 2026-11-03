import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Eye,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";
import { PublicPageShell } from "@/components/marketing/PublicPageShell";

export const AccessibilityDeclaration: React.FC = () => {
  const { isRTL } = useLang();
  const currentDate = new Date().toLocaleDateString("he-IL");

  return (
    <>
      <Helmet>
        <title>הצהרת נגישות - Portfolio Demo Accessibility Declaration</title>
        <meta
          name="description"
          content="הצהרת נגישות - עמידה בתקן WCAG 2.2 AA ותקן ישראלי 5568 - Portfolio Demo"
        />
        <meta
          name="keywords"
          content="נגישות, accessibility, WCAG, תקן ישראלי 5568, portfolio demo"
        />
      </Helmet>
      {/* The declaration is written in Hebrew, so it always reads right to left */}
      <PublicPageShell dir="rtl">
      <div
        className="rtl px-4 py-10 font-hebrew sm:px-8 md:py-16"
        lang="he"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-start">
            <h1 className="mb-3 text-[32px] font-semibold leading-[38px] tracking-[-0.02em] text-foreground md:text-[40px] md:leading-[46px]">
              הצהרת נגישות
            </h1>
            <p className="max-w-[60ch] text-lg leading-8 text-subtle">
              פרויקט פורטפוליו המדגים מחויבות לנגישות ושוויון לכל המשתמשים
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-moss-200 bg-moss-50 text-moss-700">
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WCAG 2.2 AA
              </Badge>
              <Badge variant="outline">
                <Shield className="h-3.5 w-3.5" aria-hidden="true" />
                תקן ישראלי 5568
              </Badge>
            </div>

            {/* Demo Notice */}
            <div className="mt-6 border-s-2 border-amber-400 bg-amber-50 p-4 text-start dark:bg-amber-950/40">
              <p className="mb-1 font-semibold text-amber-800 dark:text-amber-200">
                הודעה: זהו פרויקט תיק עבודות
              </p>
              <p className="text-orange-800 dark:text-orange-300 text-sm">
                זהו פרויקט הדגמה של עמית יוגב עם מידע דמו. לשאלות או לבקשות הסרה:{" "}
                <a href="mailto:amit.yogev@gmail.com" className="underline font-semibold">amit.yogev@gmail.com</a>
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Commitment Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  מחויבות החברה לנגישות
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-lg max-w-none text-right dark:prose-invert">
                <p>
                  פרויקט הדגמה זה מציג מחויבות לאפשר לאנשים עם מוגבלויות להשתמש באתר
                  באופן שוויוני, מכובד, נוח ועצמאי.
                </p>
                <p>
                  הפרויקט בנוי על פי חוק שוויון זכויות לאנשים עם מוגבלות,
                  התשנ"ח-1998 ותקנות שוויון זכויות לאנשים עם מוגבלות (התאמות
                  נגישות לשירות), התשע"ג-2013.
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-3 italic">
                  זהו פרויקט פורטפוליו להדגמה בלבד.
                </p>
              </CardContent>
            </Card>

            {/* Accessibility Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  תכונות נגישות באתר
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">
                      תכונות חזותיות
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        הגדלה והקטנה של גודל הטקסט
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        שינוי ניגודיות צבעים
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        היפוך צבעים
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        מעבר לגווני אפור
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        הדגשת קישורים
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        הסתרת תמונות
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-lg">תכונות ניווט</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        ניווט מקלדת מלא
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        סמן עכבר מוגדל
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        מדריך קריאה
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        הפחתת תנועות ואנימציות
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        תמיכה בקוראי מסך
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        קיצורי מקשים
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standards Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  עמידה בתקנים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">תקנים בינלאומיים</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        >
                          AA
                        </Badge>
                        <div>
                          <p className="font-medium">WCAG 2.2</p>
                          <p className="text-sm text-muted-foreground">
                            קווים מנחים לנגישות תוכן אינטרנט
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">תקנים ישראליים</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                        >
                          5568
                        </Badge>
                        <div>
                          <p className="font-medium">תקן ישראלי 5568</p>
                          <p className="text-sm text-muted-foreground">
                            נגישות אתרי אינטרנט
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Framework */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  מסגרת חוקית
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      חוק שוויון זכויות לאנשים עם מוגבלות
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      התשנ"ח-1998 מחייב הנגשת שירותים לציבור אנשים עם מוגבלויות
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      תקנות התאמות נגישות לשירות
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      התשע"ג-2013 קובעות דרישות ספציפיות להנגשת אתרי אינטרנט
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      <strong>חשוב לדעת:</strong> הפרה של חובת הנגשה עלולה לגרור
                      קנס של עד 150,000 ₪ ופיצוי של עד 50,000 ₪ ללא הוכחת נזק.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testing and Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  בדיקות ואימות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">כלי בדיקה</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• בדיקות אוטומטיות יומיות</li>
                      <li>• בדיקות ידניות עם טכנולוגיות מסייעות</li>
                      <li>• אימות עם קוראי מסך</li>
                      <li>• בדיקות ניווט מקלדת</li>
                      <li>• בדיקות ניגודיות צבעים</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">תדירות עדכון</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• עדכון מתמיד של תכונות נגישות</li>
                      <li>• בדיקה שבועית של תקינות</li>
                      <li>• עדכון הצהרה זו מידי שנה</li>
                      <li>• תיקון בעיות תוך 14 יום</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  צור קשר לנושאי נגישות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">פרטי התקשרות</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            amit.yogev@gmail.com
                          </p>
                          <p className="text-sm text-muted-foreground">
                            דוא"ל ליצירת קשר
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          זהו פרויקט הדגמה. לשאלות אודות הפרויקט, ניתן ליצור קשר בכתובת המייל לעיל.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">זמני מענה</h3>
                    <div className="space-y-2 text-sm">
                      <p>• ימים א'-ה': 9:00-17:00</p>
                      <p>• מענה לפניות תוך 48 שעות</p>
                      <p>• תיקון בעיות תוך 14 יום עבודה</p>
                    </div>

                    <Button className="mt-4" variant="outline" asChild>
                      <a href="mailto:amit.yogev@gmail.com">
                        <Mail className="w-4 h-4 mr-2" />
                        שלח פניה
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alternative Access Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  דרכי גישה חלופיות
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    במקרה שחלק מתכני האתר אינו נגיש לך, אנו מציעים דרכי גישה
                    חלופיות:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">שירות טלפוני</h4>
                      <p className="text-sm text-muted-foreground">
                        צור קשר עם נציג שירות שיעזור לך לגשת למידע הדרוש
                      </p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">שירות דוא"ל</h4>
                      <p className="text-sm text-muted-foreground">
                        שלח פניה בדוא"ל ונשלח לך את המידע בפורמט נגיש
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      הצהרה זו עודכנה לאחרונה ב: {currentDate}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    >
                      פעיל
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                    >
                      עדכני
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-center py-8">
              <div className="flex justify-center gap-4 flex-wrap">
                <Button variant="outline" asChild>
                  <a
                    href="https://www.kolzchut.org.il/he/הנגשת_אתרי_אינטרנט_ואפליקציות_לאנשים_עם_מוגבלות"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    מידע על חובת הנגישות
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </a>
                </Button>

                <Button variant="outline" asChild>
                  <a
                    href="https://www.netzigut.gov.il/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    נציבות שוויון זכויות
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </PublicPageShell>
    </>
  );
};

export default AccessibilityDeclaration;
