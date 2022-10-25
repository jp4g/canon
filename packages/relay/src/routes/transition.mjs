import { UserStateTransitionProof } from '@unirep/contracts'
import { ethers } from 'ethers'
import TransactionManager from '../singletons/TransactionManager.mjs'

export default ({ app, db, synchronizer }) => {
  app.post('/api/transition', async (req, res) => {

    const { publicSignals, proof } = req.body
    const transitionProof = new UserStateTransitionProof(publicSignals, proof, synchronizer.prover)
    const valid = await transitionProof.verify()
    if (!valid) {
      res.status(400).json({ error: 'Invalid proof' })
      return
    }

    const calldata = synchronizer.unirepContract.interface.encodeFunctionData(
      'userStateTransition',
      [transitionProof.publicSignals, transitionProof.proof]
    )
    const hash = await TransactionManager.queueTransaction(
      synchronizer.unirepContract.address,
      calldata
    )
    res.json({ hash })

  })
}
