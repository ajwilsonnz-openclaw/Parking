import { NextRequest, NextResponse } from 'next/server';
import { queryDb, ensureSchema, execDb } from '@/lib/db';

export const runtime = 'edge';

const CANONICAL_BAYS = [
  {"id":"feat_1786662239741_0","site_id":"site_millennium_village","row_id":"row_1786662239741","bay_number":"V-23","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69693079590797,-36.72904764988863],[174.69690502016766,-36.729046616963565],[174.6969078218612,-36.72900170704706],[174.69693359760154,-36.72900273997213],[174.69693079590797,-36.72904764988863]]]}},
  {"id":"feat_1786662239741_1","site_id":"site_millennium_village","row_id":"row_1786662239741","bay_number":"V-22","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69690502016766,-36.729046616963565],[174.696879244428,-36.729045584032946],[174.6968820461215,-36.72900067411644],[174.6969078218612,-36.72900170704706],[174.69690502016766,-36.729046616963565]]]}},
  {"id":"feat_1786662239741_2","site_id":"site_millennium_village","row_id":"row_1786662239741","bay_number":"V-21","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.696879244428,-36.729045584032946],[174.69685346868906,-36.72904455109677],[174.69685627038254,-36.728999641180266],[174.6968820461215,-36.72900067411644],[174.696879244428,-36.729045584032946]]]}},
  {"id":"feat_1786662277405_0","site_id":"site_millennium_village","row_id":"row_1786662277405","bay_number":"R-11","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69611138105392,-36.72933571141595],[174.69611204258155,-36.72935638898808],[174.69605595652507,-36.729357541570586],[174.69605529501254,-36.729336863998455],[174.69611138105392,-36.72933571141595]]]}},
  {"id":"feat_1786662277405_1","site_id":"site_millennium_village","row_id":"row_1786662277405","bay_number":"V-06","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69611204258155,-36.72935638898808],[174.69611270410957,-36.7293770665602],[174.69605661803794,-36.72937821914271],[174.69605595652507,-36.729357541570586],[174.69611204258155,-36.72935638898808]]]}},
  {"id":"feat_1786662277405_2","site_id":"site_millennium_village","row_id":"row_1786662277405","bay_number":"V-07","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69611270410957,-36.7293770665602],[174.69611336563796,-36.729397744132314],[174.6960572795512,-36.72939889671483],[174.69605661803794,-36.72937821914271],[174.69611270410957,-36.7293770665602]]]}},
  {"id":"feat_1786662277405_3","site_id":"site_millennium_village","row_id":"row_1786662277405","bay_number":"V-08","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69611336563796,-36.729397744132314],[174.69611402716666,-36.72941842170444],[174.69605794106482,-36.72941957428694],[174.6960572795512,-36.72939889671483],[174.69611336563796,-36.729397744132314]]]}},
  {"id":"feat_1786662427549_0","site_id":"site_millennium_village","row_id":"row_1786662427549","bay_number":"R-10","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69624951481822,-36.72938193014249],[174.69624993784424,-36.729402611732006],[174.69619384088887,-36.72940334876734],[174.69619341787794,-36.72938266717782],[174.69624951481822,-36.72938193014249]]]}},
  {"id":"feat_1786662427549_1","site_id":"site_millennium_village","row_id":"row_1786662427549","bay_number":"V-10","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69624993784424,-36.729402611732006],[174.6962503608705,-36.729423293321524],[174.6961942639,-36.72942403035686],[174.69619384088887,-36.72940334876734],[174.69624993784424,-36.729402611732006]]]}},
  {"id":"feat_1786662427549_2","site_id":"site_millennium_village","row_id":"row_1786662427549","bay_number":"V-09","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6962503608705,-36.729423293321524],[174.696250783897,-36.729443974911035],[174.6961946869114,-36.72944471194638],[174.6961942639,-36.72942403035686],[174.6962503608705,-36.729423293321524]]]}},
  {"id":"feat_1786663218783_clone_1","site_id":"site_millennium_village","row_id":"row_1786663218783","bay_number":"R-09","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69623878598213,-36.72924004931218],[174.69623944751095,-36.7292607268843],[174.69618336140923,-36.72926187946681],[174.69618269989542,-36.72924120189469],[174.69623878598213,-36.72924004931218]]]}},
  {"id":"feat_1786663218783_clone_2","site_id":"site_millennium_village","row_id":"row_1786663218783","bay_number":"R-08","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69623944751095,-36.7292607268843],[174.69624010903988,-36.729281404456415],[174.69618402293816,-36.72928255703893],[174.69618336142423,-36.729261879466804],[174.69623944751095,-36.7292607268843]]]}},
  {"id":"feat_1786663271678_0","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"R-03","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6965324878693,-36.72924972301347],[174.6965067355322,-36.72924836514342],[174.6965104186147,-36.72920349612104],[174.69653617095187,-36.72920485399109],[174.6965324878693,-36.72924972301347]]]}},
  {"id":"feat_1786663271678_1","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"R-05","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6965067355322,-36.72924836514342],[174.69648098319604,-36.729247007267816],[174.69648466627854,-36.729202138245434],[174.6965104186147,-36.72920349612104],[174.6965067355322,-36.72924836514342]]]}},
  {"id":"feat_1786663271678_2","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-20","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69648098319604,-36.729247007267816],[174.69645523086078,-36.72924564938667],[174.69645891394313,-36.729200780364295],[174.69648466627854,-36.729202138245434],[174.69648098319604,-36.729247007267816]]]}},
  {"id":"feat_1786663271678_3","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-19","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69645523086078,-36.72924564938667],[174.69642947852643,-36.729244291499974],[174.69643316160875,-36.72919942247759],[174.69645891394313,-36.729200780364295],[174.69645523086078,-36.72924564938667]]]}},
  {"id":"feat_1786663271678_4","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-18","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69642947852643,-36.729244291499974],[174.69640372619295,-36.72924293360772],[174.69640740927517,-36.72919806458535],[174.69643316160875,-36.72919942247759],[174.69642947852643,-36.729244291499974]]]}},
  {"id":"feat_1786663271678_5","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-17","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69640372619295,-36.72924293360772],[174.69637797386042,-36.72924157570994],[174.6963816569426,-36.72919670668756],[174.69640740927517,-36.72919806458535],[174.69640372619295,-36.72924293360772]]]}},
  {"id":"feat_1786663271678_6","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-16","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69637797386042,-36.72924157570994],[174.6963522215288,-36.72924021780661],[174.6963559046109,-36.72919534878423],[174.6963816569426,-36.72919670668756],[174.69637797386042,-36.72924157570994]]]}},
  {"id":"feat_1786663271678_7","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-15","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6963522215288,-36.72924021780661],[174.69632646919806,-36.72923885989771],[174.6963301522801,-36.72919399087534],[174.6963559046109,-36.72919534878423],[174.6963522215288,-36.72924021780661]]]}},
  {"id":"feat_1786663271678_8","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-14","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69632646919806,-36.72923885989771],[174.69630071686828,-36.72923750198328],[174.69630439995026,-36.729192632960896],[174.6963301522801,-36.72919399087534],[174.69632646919806,-36.72923885989771]]]}},
  {"id":"feat_1786663271678_9","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-13","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69630071686828,-36.72923750198328],[174.69627496453938,-36.72923614406329],[174.69627864762126,-36.72919127504092],[174.69630439995026,-36.729192632960896],[174.69630071686828,-36.72923750198328]]]}},
  {"id":"feat_1786663271678_10","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-12","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69627496453938,-36.72923614406329],[174.6962492122114,-36.729234786137766],[174.69625289529327,-36.729189917115384],[174.69627864762126,-36.72919127504092],[174.69627496453938,-36.72923614406329]]]}},
  {"id":"feat_1786663271678_11","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"V-11","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6962492122114,-36.729234786137766],[174.69622345988432,-36.72923342820668],[174.6962271429661,-36.72918855918431],[174.69625289529327,-36.729189917115384],[174.6962492122114,-36.729234786137766]]]}},
  {"id":"feat_1786663271678_12","site_id":"site_millennium_village","row_id":"row_1786663271678","bay_number":"R-09","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69622345988432,-36.72923342820668],[174.69619770755816,-36.729232070270065],[174.69620139063989,-36.72918720124769],[174.6962271429661,-36.72918855918431],[174.69622345988432,-36.72923342820668]]]}},
  {"id":"feat_1786663805447_clone_1","site_id":"site_millennium_village","row_id":"row_1786663805447","bay_number":"R-16","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69596520066267,-36.72917448308231],[174.6959658621917,-36.72919516065442],[174.69590977609,-36.72919631323693],[174.69590911457595,-36.72917563566481],[174.69596520066267,-36.72917448308231]]]}},
  {"id":"feat_1786663863759_clone_1","site_id":"site_millennium_village","row_id":"row_1786663863759","bay_number":"R-13","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69610065221792,-36.729190605930924],[174.6961013137472,-36.72921128350303],[174.69604522764547,-36.72921243608555],[174.6960445661312,-36.729191758513416],[174.69610065221792,-36.729190605930924]]]}},
  {"id":"feat_1786663908191_clone_1","site_id":"site_millennium_village","row_id":"row_1786663908191","bay_number":"V-06","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6961120425815,-36.729356388988066],[174.69611270410928,-36.729377066560204],[174.6960566180528,-36.7293782191427],[174.69605595654014,-36.72935754157058],[174.6961120425815,-36.729356388988066]]]}},
  {"id":"feat_1786663908191_clone_2","site_id":"site_millennium_village","row_id":"row_1786663908191","bay_number":"V-07","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69611270410928,-36.72937706656019],[174.6961133656373,-36.72939774413233],[174.69605727958083,-36.72939889671483],[174.69605661806793,-36.7293782191427],[174.69611270410928,-36.72937706656019]]]}},
  {"id":"feat_1786663926718_0","site_id":"site_millennium_village","row_id":"row_1786663926718","bay_number":"R-18","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6959075331688,-36.729225001329944],[174.69588175437738,-36.72922598518529],[174.69587908575875,-36.729181070062715],[174.6959048645502,-36.729180086207386],[174.6959075331688,-36.729225001329944]]]}},
  {"id":"feat_1786663926718_1","site_id":"site_millennium_village","row_id":"row_1786663926718","bay_number":"V-04","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69588175437738,-36.72922598518529],[174.69585597558526,-36.72922696903505],[174.6958533069666,-36.72918205391248],[174.69587908575875,-36.729181070062715],[174.69588175437738,-36.72922598518529]]]}},
  {"id":"feat_1786664054167_clone_1","site_id":"site_millennium_village","row_id":"row_1786664054167","bay_number":"R-12","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69610869884494,-36.72928411838602],[174.69610936037273,-36.72930479595816],[174.69605327431626,-36.729305948540656],[174.69605261280358,-36.72928527096853],[174.69610869884494,-36.72928411838602]]]}},
  {"id":"feat_1786664130007_clone_1","site_id":"site_millennium_village","row_id":"row_1786664130007","bay_number":"R-10","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69629108905795,-36.72908634478349],[174.6962653367324,-36.72908498684687],[174.6962690198292,-36.729040117824496],[174.69629477215508,-36.729041475761115],[174.69629108905795,-36.72908634478349]]]}},
  {"id":"feat_1786664130007_clone_2","site_id":"site_millennium_village","row_id":"row_1786664130007","bay_number":"R-11","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6962653367165,-36.72908498684881],[174.69623958439107,-36.72908362891219],[174.69624326750287,-36.72903875988982],[174.69626901982818,-36.729040117826436],[174.6962653367165,-36.72908498684881]]]}},
  {"id":"feat_1786664792136_clone_1","site_id":"site_millennium_village","row_id":"row_1786664792135","bay_number":"V-05","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69605371356013,-36.72913041394555],[174.6960279612346,-36.72912905600893],[174.69603164433138,-36.729084186986555],[174.69605739665727,-36.72908554492317],[174.69605371356013,-36.72913041394555]]]}},
  {"id":"feat_1786664842631_0","site_id":"site_millennium_village","row_id":"row_1786664842631","bay_number":"R-29","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6958002448082,-36.72905839847248],[174.69582581612653,-36.729055603741614],[174.6958333965525,-36.72910015742966],[174.69580782523448,-36.72910295216054],[174.6958002448082,-36.72905839847248]]]}},
  {"id":"feat_1786664869984_clone_1","site_id":"site_millennium_village","row_id":"row_1786664869984","bay_number":"R-28","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69580963253978,-36.72910354250828],[174.69583520385711,-36.729100747777416],[174.69584278429787,-36.729145301465465],[174.69581721298087,-36.72914809619634],[174.69580963253978,-36.72910354250828]]]}},
  {"id":"feat_1786665148143_0","site_id":"site_millennium_village","row_id":"row_1786665148143","bay_number":"R-32","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69538852572444,-36.7289595114442],[174.6954437045542,-36.72895137824361],[174.69544837254162,-36.72897172144926],[174.69539319371233,-36.72897985464986],[174.69538852572444,-36.7289595114442]]]}},
  {"id":"feat_1786665148143_1","site_id":"site_millennium_village","row_id":"row_1786665148143","bay_number":"R-24","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.6954437045542,-36.72895137824361],[174.69549888337227,-36.728943245017554],[174.69550355135917,-36.728963588223216],[174.69544837254162,-36.72897172144926],[174.6954437045542,-36.72895137824361]]]}},
  {"id":"feat_1786665148143_2","site_id":"site_millennium_village","row_id":"row_1786665148143","bay_number":"R-25","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69549888337227,-36.728943245017554],[174.69555406217867,-36.72893511176602],[174.6955587301651,-36.72895545497169],[174.69550355135917,-36.728963588223216],[174.69549888337227,-36.728943245017554]]]}},
  {"id":"feat_1786665148143_3","site_id":"site_millennium_village","row_id":"row_1786665148143","bay_number":"V-03","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69555406217867,-36.72893511176602],[174.69560924097334,-36.72892697848902],[174.69561390895927,-36.72894732169468],[174.6955587301651,-36.72895545497169],[174.69555406217867,-36.72893511176602]]]}},
  {"id":"feat_1786665311943_0","site_id":"site_millennium_village","row_id":"row_1786665311943","bay_number":"R-32","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6953831613064,-36.72896703546171],[174.69535738557923,-36.728968068389875],[174.69535458386358,-36.72892315847432],[174.69538035959073,-36.72892212554616],[174.6953831613064,-36.72896703546171]]]}},
  {"id":"feat_1786665311943_1","site_id":"site_millennium_village","row_id":"row_1786665311943","bay_number":"R-31","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69535738557923,-36.728968068389875],[174.69533160985142,-36.7289691013125],[174.6953288081357,-36.72892419139696],[174.69535458386358,-36.72892315847432],[174.69535738557923,-36.728968068389875]]]}},
  {"id":"feat_1786665311943_2","site_id":"site_millennium_village","row_id":"row_1786665311943","bay_number":"R-31","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69533160985142,-36.7289691013125],[174.6953058341229,-36.728970134229556],[174.69530303240714,-36.728925224314],[174.6953288081357,-36.72892419139696],[174.69533160985142,-36.7289691013125]]]}},
  {"id":"feat_1786665311943_3","site_id":"site_millennium_village","row_id":"row_1786665311943","bay_number":"R-19","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6953058341229,-36.728970134229556],[174.69528005839365,-36.72897116714105],[174.69527725667783,-36.72892625722549],[174.69530303240714,-36.728925224314],[174.6953058341229,-36.728970134229556]]]}},
  {"id":"feat_1786665311943_4","site_id":"site_millennium_village","row_id":"row_1786665311943","bay_number":"R-33","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69528005839365,-36.72897116714105],[174.69525428266374,-36.72897220004699],[174.69525148094792,-36.72892729013143],[174.69527725667783,-36.72892625722549],[174.69528005839365,-36.72897116714105]]]}},
  {"id":"feat_1786665452567_0","site_id":"site_millennium_village","row_id":"row_1786665452567","bay_number":"R-20","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69522625207904,-36.729020778422395],[174.6951702409902,-36.72901818857144],[174.6951717274097,-36.72899753853902],[174.69522773849857,-36.72900012838998],[174.69522625207904,-36.729020778422395]]]}},
  {"id":"feat_1786665452568_1","site_id":"site_millennium_village","row_id":"row_1786665452567","bay_number":"R-21","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.6951702409902,-36.72901818857144],[174.69511422990522,-36.72901559869425],[174.69511571632464,-36.72899494866183],[174.6951717274097,-36.72899753853902],[174.6951702409902,-36.72901818857144]]]}},
  {"id":"feat_1786665452568_2","site_id":"site_millennium_village","row_id":"row_1786665452567","bay_number":"R-22","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69511422990522,-36.72901559869425],[174.695058218824,-36.729013008790794],[174.69505970524338,-36.728992358758376],[174.69511571632464,-36.72899494866183],[174.69511422990522,-36.72901559869425]]]}},
  {"id":"feat_1786665452568_3","site_id":"site_millennium_village","row_id":"row_1786665452567","bay_number":"R-23","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.695058218824,-36.729013008790794],[174.6950022077465,-36.729010418861115],[174.69500369416588,-36.7289897688287],[174.69505970524338,-36.728992358758376],[174.695058218824,-36.729013008790794]]]}},
  {"id":"feat_1786666167743_0","site_id":"site_millennium_village","row_id":"row_1786666167743","bay_number":"V-01","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.6945516765118,-36.72910891679648],[174.69460721692977,-36.729102557643564],[174.6946108667207,-36.7291230341245],[174.694555326303,-36.729129393277425],[174.6945516765118,-36.72910891679648]]]}},
  {"id":"feat_1786666167743_1","site_id":"site_millennium_village","row_id":"row_1786666167743","bay_number":"V-02","bay_type":"visitor","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"end_to_end","geometry":{"type":"Polygon","coordinates":[[[174.69460721692977,-36.729102557643564],[174.69466275733862,-36.72909619846486],[174.6946664071292,-36.7291166749458],[174.6946108667207,-36.7291230341245],[174.69460721692977,-36.729102557643564]]]}},
  {"id":"feat_1786666245519_0","site_id":"site_millennium_village","row_id":"row_1786666245519","bay_number":"R-27","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69435989856723,-36.72911966537177],[174.69435894337144,-36.729140335567905],[174.69430287752223,-36.72913867128809],[174.69430383273314,-36.729118001091955],[174.69435989856723,-36.72911966537177]]]}},
  {"id":"feat_1786666346183_0","site_id":"site_millennium_village","row_id":"row_1786666346183","bay_number":"R-30","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69438269734385,-36.728888570671565],[174.69440850527292,-36.72888857067515],[174.69440850525564,-36.72893353669333],[174.6943826973266,-36.728933536689745],[174.69438269734385,-36.728888570671565]]]}},
  {"id":"feat_1786666346184_1","site_id":"site_millennium_village","row_id":"row_1786666346183","bay_number":"R-26","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69440850527292,-36.72888857067515],[174.69443431320198,-36.72888857067315],[174.69443431318467,-36.72893353669133],[174.69440850525564,-36.72893353669333],[174.69440850527292,-36.72888857067515]]]}},
  {"id":"feat_1786666439905_clone_1","site_id":"site_millennium_village","row_id":"row_1786666439904","bay_number":"R-01","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69677656888962,-36.72915621051648],[174.69675081656464,-36.72915485257985],[174.69675449967656,-36.729109983557485],[174.69688025200187,-36.729111341494104],[174.69677656888962,-36.72915621051648]]]}},
  {"id":"feat_1786666466016_clone_1","site_id":"site_millennium_village","row_id":"row_1786666466016","bay_number":"R-04","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69653382897377,-36.72914761166047],[174.69650807664925,-36.729146253723854],[174.69651175977629,-36.72910138470148],[174.69653751210103,-36.7291027426381],[174.69653382897377,-36.72914761166047]]]}},
  {"id":"feat_1786666521856_clone_1","site_id":"site_millennium_village","row_id":"row_1786666521856","bay_number":"R-07","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.69634473323828,-36.72914116251781],[174.6963189809133,-36.72913980458119],[174.69632266402522,-36.72909493555882],[174.69634841635053,-36.72909629349544],[174.69634473323828,-36.72914116251781]]]}},
  {"id":"feat_1786666521856_clone_2","site_id":"site_millennium_village","row_id":"row_1786666521856","bay_number":"R-07","bay_type":"resident","status":"available","width_m":2.3,"depth_m":5,"layout_mode":"side_by_side","geometry":{"type":"Polygon","coordinates":[[[174.6963189809456,-36.729139804585685],[174.69629322862096,-36.72913844664907],[174.6962969117481,-36.72909357762669],[174.69632266407285,-36.72909493556331],[174.6963189809456,-36.729139804585685]]]}}
];

export async function GET(req: NextRequest) {
  await ensureSchema().catch(() => {});

  try {
    // 1. Ensure carpark_bays table exists
    await execDb(`
      CREATE TABLE IF NOT EXISTS carpark_bays (
        id TEXT PRIMARY KEY,
        site_id TEXT NOT NULL DEFAULT 'site_millennium_village',
        row_id TEXT NOT NULL,
        bay_number TEXT NOT NULL,
        bay_type TEXT NOT NULL,
        status TEXT DEFAULT 'available',
        width_m REAL DEFAULT 2.3,
        depth_m REAL DEFAULT 5.0,
        layout_mode TEXT DEFAULT 'side_by_side',
        geometry TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).catch(() => {});

    // 2. Fetch bays from DB or fallback to canonical data
    let baysFromDb = await queryDb('SELECT * FROM carpark_bays WHERE site_id = ?', ['site_millennium_village']).catch(() => []);

    if (!baysFromDb || baysFromDb.length === 0) {
      // Auto-seed table with canonical features
      for (const b of CANONICAL_BAYS) {
        await execDb(
          `INSERT OR REPLACE INTO carpark_bays (id, site_id, row_id, bay_number, bay_type, status, width_m, depth_m, layout_mode, geometry)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.site_id, b.row_id, b.bay_number, b.bay_type, b.status, b.width_m, b.depth_m, b.layout_mode, JSON.stringify(b.geometry)]
        ).catch(() => {});
      }
      baysFromDb = await queryDb('SELECT * FROM carpark_bays WHERE site_id = ?', ['site_millennium_village']).catch(() => []);
    }

    const bayRecords = baysFromDb && baysFromDb.length > 0 ? baysFromDb : CANONICAL_BAYS;

    // 3. Fetch active sessions & carpark status for live occupancy sync
    const [activeSessions, carparks] = await Promise.all([
      queryDb('SELECT * FROM parking_sessions WHERE is_active = 1').catch(() => []),
      queryDb('SELECT * FROM carparks').catch(() => []),
    ]);

    const activeSpotMap = new Set<string>();
    const sessionDetailMap = new Map<string, any>();

    (activeSessions || []).forEach((s: any) => {
      const nowMs = Date.now();
      const endMs = new Date(s.expected_end_time).getTime();
      if (endMs > nowMs && !s.end_time) {
        const spot = String(s.spot_number || '').toUpperCase().trim();
        activeSpotMap.add(spot);
        // Normalize 'V01' -> 'V-01', 'V-01' -> 'V-01'
        const normalized = spot.replace(/^([VR])-?0*(\d+)$/, '$1-$2');
        activeSpotMap.add(normalized);
        sessionDetailMap.set(spot, s);
        sessionDetailMap.set(normalized, s);
      }
    });

    (carparks || []).forEach((cp: any) => {
      if (cp.status === 'occupied' || cp.status === 'rented') {
        const spot = String(cp.spot_number || '').toUpperCase().trim();
        activeSpotMap.add(spot);
      }
    });

    // 4. Assemble standard GeoJSON FeatureCollection
    const features = bayRecords.map((bay: any) => {
      let geom = bay.geometry;
      if (typeof geom === 'string') {
        try { geom = JSON.parse(geom); } catch {}
      }

      const bayNum = String(bay.bay_number || '').toUpperCase().trim();
      const normalizedBay = bayNum.replace(/^([VR])-?0*(\d+)$/, '$1-$2');
      const isLiveOccupied = activeSpotMap.has(bayNum) || activeSpotMap.has(normalizedBay);
      const session = sessionDetailMap.get(bayNum) || sessionDetailMap.get(normalizedBay);

      let computedStatus = isLiveOccupied ? 'occupied' : (bay.status || 'available');
      if (bay.status === 'reserved') computedStatus = 'reserved';

      return {
        type: 'Feature',
        id: bay.id,
        properties: {
          bay_number: bay.bay_number,
          row_id: bay.row_id,
          type: bay.bay_type || 'visitor',
          status: computedStatus,
          width_m: bay.width_m || 2.3,
          depth_m: bay.depth_m || 5.0,
          layout: bay.layout_mode || 'side_by_side',
          is_active_session: isLiveOccupied,
          session_plate: session?.vehicle_plate || null,
          session_visitor: session?.visitor_name || null,
          session_end: session?.expected_end_time || null,
        },
        geometry: geom,
      };
    });

    return NextResponse.json({
      type: 'FeatureCollection',
      features,
    });
  } catch (err: any) {
    console.error('[GET /api/carparks/geojson error]:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
