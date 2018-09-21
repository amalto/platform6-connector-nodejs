import { CommonMessage } from '../messages/commonMessage'
import { DataInput, DataOutput } from 'hazelcast-client/lib/serialization/Data'
import { Serializer } from 'hazelcast-client/lib/serialization/SerializationService'

class CommonMessageSerializer implements Serializer {
	getId(): number {
		return 10
	}

	read(input: DataInput) {
		return CommonMessage.decode(new Uint8Array(input.readByteArray()))
	}

	write(output: DataOutput, object: CommonMessage) {
		output.writeByteArray([...CommonMessage.encode(object).finish()])
	}
}

export default CommonMessageSerializer
