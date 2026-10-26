"""Fetch primary references; retain readable snapshots for the course audit trail."""
import concurrent.futures
import json
import re
import urllib.request
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).parent
SOURCES = [
 ('rn-networking','React Native: Networking','https://reactnative.dev/docs/network'),
 ('rn-security','React Native: Security','https://reactnative.dev/docs/security'),
 ('rn-devtools','React Native DevTools','https://reactnative.dev/docs/react-native-devtools'),
 ('rn-appstate','React Native: AppState','https://reactnative.dev/docs/appstate'),
 ('fetch','MDN: Using Fetch','https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch'),
 ('http','RFC 9110: HTTP Semantics','https://www.rfc-editor.org/rfc/rfc9110.txt'),
 ('cache','MDN: HTTP caching','https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching'),
 ('android-security','Android: Network security configuration','https://developer.android.com/privacy-and-security/security-config'),
 ('apple-ats','Apple: App Transport Security','https://developer.apple.com/documentation/security/preventing-insecure-network-connections'),
 ('android-emulator','Android: Emulator networking','https://developer.android.com/studio/run/emulator-networking'),
 ('tanstack-rn','TanStack Query v5: React Native','https://tanstack.com/query/latest/docs/framework/react/react-native'),
 ('tanstack-defaults','TanStack Query v5: Important defaults','https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults'),
 ('tanstack-offline','TanStack Query v5: Network mode','https://tanstack.com/query/latest/docs/framework/react/guides/network-mode'),
 ('tanstack-persist','TanStack Query v5: Persist query client','https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient'),
 ('netinfo','React Native NetInfo','https://raw.githubusercontent.com/react-native-netinfo/react-native-netinfo/master/README.md'),
 ('securestore','Expo SecureStore','https://docs.expo.dev/versions/latest/sdk/securestore/'),
 ('auth-native','RFC 8252: OAuth for Native Apps','https://www.rfc-editor.org/rfc/rfc8252.txt'),
 ('auth-bcp','RFC 9700: OAuth 2.0 Security Best Current Practice','https://www.rfc-editor.org/rfc/rfc9700.txt'),
 ('aws-retry','AWS Builders Library: Timeouts, retries, backoff and jitter','https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/'),
 ('otel','OpenTelemetry: Observability primer','https://opentelemetry.io/docs/concepts/observability-primer/'),
 ('otel-context','OpenTelemetry: Context propagation','https://opentelemetry.io/docs/concepts/context-propagation/'),
 ('tracecontext','W3C: Trace Context','https://www.w3.org/TR/trace-context/'),
 ('sentry-rn','Sentry: React Native tracing','https://docs.sentry.io/platforms/react-native/tracing/'),
 ('sentry-data','Sentry: React Native data management','https://docs.sentry.io/platforms/react-native/data-management/sensitive-data/'),
 ('expo-background','Expo BackgroundTask','https://docs.expo.dev/versions/latest/sdk/background-task/'),
 ('apple-background','Apple: Background URLSession transfers','https://developer.apple.com/documentation/foundation/downloading-files-in-the-background'),
 ('android-work','Android: WorkManager','https://developer.android.com/topic/libraries/architecture/workmanager'),
 ('msw-native','MSW: React Native integration','https://mswjs.io/docs/integrations/react-native/'),
 ('graphql','GraphQL: Serving over HTTP','https://graphql.org/learn/serving-over-http/'),
 ('owasp','OWASP MASVS: Network communication','https://mas.owasp.org/MASVS/05-MASVS-NETWORK/'),
 ('expo-file','Expo FileSystem','https://docs.expo.dev/versions/latest/sdk/filesystem/'),
 ('react-effects','React: Synchronizing with Effects','https://react.dev/learn/synchronizing-with-effects'),
 ('problem','RFC 9457: Problem Details for HTTP APIs','https://www.rfc-editor.org/rfc/rfc9457.txt'),
 ('websocket','MDN: WebSocket','https://developer.mozilla.org/en-US/docs/Web/API/WebSocket'),
 ('apple-ats-text','Apple: App Transport Security (Markdown)','https://developer.apple.com/documentation/security/preventing-insecure-network-connections.md'),
 ('apple-background-text','Apple: Background URLSession (Markdown)','https://developer.apple.com/documentation/foundation/downloading-files-in-the-background.md'),
 ('android-address','Android: Emulator network addresses','https://developer.android.com/studio/run/emulator-networking-address'),
 ('owasp-network','OWASP MASVS: Network controls (source)','https://raw.githubusercontent.com/OWASP/masvs/master/Document/0x10-V5-Network_communication_requirements.md'),
 ('sentry-distributed','Sentry: React Native distributed tracing','https://docs.sentry.io/platforms/react-native/tracing/trace-propagation/'),
 ('otel-js','OpenTelemetry: JavaScript supported runtimes','https://opentelemetry.io/docs/languages/js/'),
]

class Readable(HTMLParser):
 def __init__(self):
  super().__init__(); self.skip=0; self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style','svg','nav','footer'): self.skip+=1
  if tag in ('p','div','h1','h2','h3','li','pre','br'): self.parts.append('\n')
 def handle_endtag(self,tag):
  if tag in ('script','style','svg','nav','footer'): self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip: self.parts.append(data)

def fetch(item):
 id,title,url=item
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (educational-reference-research)'})
  with urllib.request.urlopen(req,timeout=25) as r:
   data=r.read().decode('utf-8','replace'); final=r.url
  if '<html' in data[:5000].lower() or '<!doctype' in data[:500].lower():
   parser=Readable(); parser.feed(data); data=''.join(parser.parts)
  data=re.sub(r'[ \t]+',' ',data); data=re.sub(r'\n\s*\n+', '\n\n',data).strip()
  (ROOT/'research'/f'{id}.txt').write_text(data)
  return {'id':id,'title':title,'url':url,'resolvedUrl':final,'retrieved':date.today().isoformat(),'characters':len(data),'ok':True}
 except Exception as e:
  return {'id':id,'title':title,'url':url,'ok':False,'error':str(e)}

if __name__=='__main__':
 (ROOT/'research').mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(fetch,SOURCES))
 (ROOT/'sources.json').write_text(json.dumps(results,indent=2))
 for r in results: print(r['id'],r.get('characters',r.get('error')))
