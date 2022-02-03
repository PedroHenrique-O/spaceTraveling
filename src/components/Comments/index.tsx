/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useUtterances } from '../../hooks/useUtterances';
import commonStyles from '../../styles/common.module.scss';

const commentNodeId = 'comments';

const Comments = () => {
  useUtterances(commentNodeId);
  return <div className={commonStyles.comments} id={commentNodeId} />;
};

export default Comments;
