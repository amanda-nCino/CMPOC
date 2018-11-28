public class SNSController {
	public SNSController(){
		init();
	}
	public SNSController(ApexPages.StandardController controller){
		init();
	}

	public void init(){
		Map<String, String> po = new Map<String, String>();
		po.put('cmURL','XXXXXX');
		po.put('usernameIn', 'XXXXXX');
		po.put('passwordIn', 'XXXXXX');
		po.put('instanceIn', 'XXXXXX');
		po.put('parentIdIn', 'XXXXXX');

		String payload = JSON.serialize(po);
		System.debug(payload);

		Sns sns = new Connector('XXXXXX', 'XXXXXX').sns('us-east-1');
		//here modify to push in correct parameters for event
		Sns.PublishResponse response = sns.publish('XXXXXX', '{"usernameIn", "'XXXXXX'"}');
	}

}